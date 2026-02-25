import React from 'react'
import UsersList from '../component/UsersList'
import ChatWindow from '../component/ChatWindow'

const Home = () => {
    return (
        <div className="flex w-full h-screen">
            <div className="bg-gray-50 w-1/4 h-screen overflow-y-auto">
                <UsersList />
            </div>
            <div className="w-3/4 h-screen overflow-y-auto">
                <ChatWindow/>
            </div>
        </div>
    )
}

export default Home