// const OpenAI = require('openai')
// const Message = require('../schema/message.schema')
// const Conversation = require('../schema/conversation.schema')
// const Users = require('../schema/user.schema')
// const { notifyChatToSocket } = require('../thirdParty-api/socket.api')
// const { delAsync } = require('../services/redis.service')

// class AIController {
//     constructor() {
//         // Initialize OpenAI client
//         this.openai = new OpenAI({
//             apiKey: process.env.OPENAI_API_KEY
//         })
//     }

//     async generateImage(req, res) {
//         try {
//             const { prompt, userId, size = '1024x1024', quality = 'standard' } = req.body

//             // Validate inputs
//             if (!prompt) {
//                 return res.status(400).json({ message: 'Prompt is required' })
//             }

//             if (!userId) {
//                 return res.status(400).json({ message: 'User ID is required' })
//             }

//             // Verify receiver user exists
//             const receiverUser = await Users.findById(userId)
//             if (!receiverUser) {
//                 return res.status(400).json({ message: 'User ID does not exist' })
//             }

//             console.log('🎨 Generating image with DALL-E...')
//             console.log('Prompt:', prompt)

//             // Generate image using OpenAI DALL-E
//             const response = await this.openai.images.generate({
//                 model: 'dall-e-3',
//                 prompt: prompt,
//                 n: 1,
//                 size: size,
//                 quality: quality,
//                 response_format: 'url'
//             })

//             const imageUrl = response.data[0].url
//             console.log('✅ Image generated successfully:', imageUrl)

//             // Find or create conversation
//             let existingChat = await Conversation.findOne({
//                 isGroupChat: false,
//                 participants: { $all: [userId, req.userId] }
//             })

//             // If no conversation exists, create one and add to friends
//             if (!existingChat) {
//                 existingChat = new Conversation({
//                     participants: [userId, req.userId],
//                     chatName: '1to1',
//                     isGroupChat: false
//                 })
//                 await existingChat.save()

//                 // Add each user to the other's friends list
//                 await Users.findByIdAndUpdate(userId, {
//                     $addToSet: { friends: req.userId }
//                 })
//                 await Users.findByIdAndUpdate(req.userId, {
//                     $addToSet: { friends: userId }
//                 })
//             }

//             // Save the generated image as a message
//             const newMessage = new Message({
//                 chatId: existingChat._id,
//                 sender: req.userId,
//                 content: `Generated image: ${prompt}`,
//                 messageType: 'image',
//                 fileUrl: imageUrl
//             })

//             const savedMessage = await newMessage.save()

//             // Invalidate messages cache for both users
//             const cacheKey1 = `messages:${req.userId}:${userId}`
//             const cacheKey2 = `messages:${userId}:${req.userId}`
//             await Promise.all([
//                 delAsync(cacheKey1),
//                 delAsync(cacheKey2)
//             ])

//             // Notify socket server
//             notifyChatToSocket(
//                 {
//                     chatId: savedMessage.chatId,
//                     senderId: savedMessage.sender,
//                     receiverId: receiverUser._id,
//                     message: savedMessage.content,
//                     messageType: savedMessage.messageType,
//                     fileUrl: savedMessage.fileUrl
//                 },
//                 req.header('Authorization')
//             )
//                 .then(() => {
//                     console.log('✅ Socket notified successfully')
//                 })
//                 .catch((error) => {
//                     console.error('❌ Failed to notify socket:', error.message)
//                 })

//             res.status(200).json({
//                 message: 'Image generated successfully',
//                 data: {
//                     imageUrl: imageUrl,
//                     prompt: prompt,
//                     messageId: savedMessage._id,
//                     chatId: existingChat._id
//                 }
//             })
//         } catch (error) {
//             console.error('❌ Error generating image:', error)

//             // Handle OpenAI specific errors
//             if (error.status === 401) {
//                 return res.status(500).json({
//                     message: 'OpenAI API key is invalid or missing',
//                     error: error.message
//                 })
//             }

//             if (error.status === 429) {
//                 return res.status(429).json({
//                     message: 'Rate limit exceeded. Please try again later.',
//                     error: error.message
//                 })
//             }

//             res.status(500).json({
//                 message: 'Failed to generate image',
//                 error: error.message
//             })
//         }
//     }

//     async generateImageVariation(req, res) {
//         try {
//             const { imageUrl, userId } = req.body

//             if (!imageUrl) {
//                 return res.status(400).json({ message: 'Image URL is required' })
//             }

//             if (!userId) {
//                 return res.status(400).json({ message: 'User ID is required' })
//             }

//             // Note: For variations, you'd need to download the image and send it as a file
//             // This is a simplified version that generates a new image instead
//             return res.status(501).json({
//                 message: 'Image variation feature coming soon'
//             })
//         } catch (error) {
//             console.error('❌ Error generating image variation:', error)
//             res.status(500).json({
//                 message: 'Failed to generate image variation',
//                 error: error.message
//             })
//         }
//     }

//     async generateTextCompletion(req, res) {
//         try {
//             const { prompt, userId, model = 'gpt-3.5-turbo' } = req.body

//             if (!prompt) {
//                 return res.status(400).json({ message: 'Prompt is required' })
//             }

//             if (!userId) {
//                 return res.status(400).json({ message: 'User ID is required' })
//             }

//             const receiverUser = await Users.findById(userId)
//             if (!receiverUser) {
//                 return res.status(400).json({ message: 'User ID does not exist' })
//             }

//             console.log('🤖 Generating text completion with ChatGPT...')

//             const completion = await this.openai.chat.completions.create({
//                 model: model,
//                 messages: [
//                     {
//                         role: 'user',
//                         content: prompt
//                     }
//                 ],
//                 max_tokens: 500
//             })

//             const responseText = completion.choices[0].message.content

//             // Find or create conversation
//             let existingChat = await Conversation.findOne({
//                 isGroupChat: false,
//                 participants: { $all: [userId, req.userId] }
//             })

//             if (!existingChat) {
//                 existingChat = new Conversation({
//                     participants: [userId, req.userId],
//                     chatName: '1to1',
//                     isGroupChat: false
//                 })
//                 await existingChat.save()

//                 await Users.findByIdAndUpdate(userId, {
//                     $addToSet: { friends: req.userId }
//                 })
//                 await Users.findByIdAndUpdate(req.userId, {
//                     $addToSet: { friends: userId }
//                 })
//             }

//             // Save AI response as a message
//             const newMessage = new Message({
//                 chatId: existingChat._id,
//                 sender: req.userId,
//                 content: responseText,
//                 messageType: 'text'
//             })

//             const savedMessage = await newMessage.save()

//             // Invalidate cache
//             const cacheKey1 = `messages:${req.userId}:${userId}`
//             const cacheKey2 = `messages:${userId}:${req.userId}`
//             await Promise.all([
//                 delAsync(cacheKey1),
//                 delAsync(cacheKey2)
//             ])

//             // Notify socket
//             notifyChatToSocket(
//                 {
//                     chatId: savedMessage.chatId,
//                     senderId: savedMessage.sender,
//                     receiverId: receiverUser._id,
//                     message: savedMessage.content,
//                     messageType: savedMessage.messageType,
//                     fileUrl: savedMessage.fileUrl || ''
//                 },
//                 req.header('Authorization')
//             )
//                 .then(() => {
//                     console.log('✅ Socket notified successfully')
//                 })
//                 .catch((error) => {
//                     console.error('❌ Failed to notify socket:', error.message)
//                 })

//             res.status(200).json({
//                 message: 'Text generated successfully',
//                 data: {
//                     response: responseText,
//                     messageId: savedMessage._id
//                 }
//             })
//         } catch (error) {
//             console.error('❌ Error generating text:', error)
//             res.status(500).json({
//                 message: 'Failed to generate text',
//                 error: error.message
//             })
//         }
//     }
// }

// module.exports = new AIController()

