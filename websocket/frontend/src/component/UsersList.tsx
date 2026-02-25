import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { createConversation, geAllUsersByConversation } from '../services/user.api'
import { useLocation, useNavigate } from 'react-router-dom';

const UsersList = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = useMemo(() => {
        return new URLSearchParams(location.search);
    }, [location.search]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        } else if (diffInHours < 168) {
            return date.toLocaleDateString('en-US', { weekday: 'short' })
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
    }

    useEffect(() => {
        fetchAllUsersByConversation();
    }, []);

    const fetchAllUsersByConversation = useCallback(() => {
        geAllUsersByConversation()
        .then((response) => {
            setUsers(response.data);
        })
        .catch((error) => {
            console.log(error);
        });
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                buttonRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsPopoverOpen(false);
            }
        };

        if (isPopoverOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPopoverOpen]);

    const handleAddUser = (userId: string) => {
        console.log(userId);
        createConversation({ reqUserId: userId })
        .then((response: any) => {
            console.log(response);
            fetchAllUsersByConversation();
        })
        .catch((error: any) => {
            console.log(error);
        });
    }

    const handleChat = (userId: string) => {
        if(userId) {
            searchParams.set('conversationId', userId);
            navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
        }
    }

    return (
        <div className="bg-white w-full relative">
            <div className="bg-gray-800 text-white px-6 py-4 shadow-md">
                <div className="text-xl font-semibold">Sample</div>
            </div>

            <div className="relative flex justify-end px-6 py-2">
                <button 
                    ref={buttonRef}
                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                    + New
                </button>

                {/* Popover */}
                {isPopoverOpen && (
                    <div
                        ref={popoverRef}
                        className="absolute top-full right-6 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
                    >
                        {/* Menu List */}
                        <div className='bg-gray-600 px-2 py-2'>
                            <input type="text" placeholder="Search" className="w-full px-2 border border-gray-200 rounded-xl" />
                        </div>
                        <div className="py-2 h-64 overflow-y-auto">
                            {users.map((user) => (
                                <div className='flex items-center justify-between'>
                                    <div
                                        key={user._id}
                                        className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                                    >
                                        <span className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-white text-lg font-semibold mr-2">{user.name.charAt(0).toUpperCase()}</span>
                                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                    </div>
                                    <div className='cursor-pointer' onClick={() => handleAddUser(user._id)}>
                                        <div className="rounded-xl px-2 border border-gray-600">+</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-y-auto">
                {users.map((user, index) => (
                    <div
                        key={user._id}
                        className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150 border-b border-gray-200 last:border-b-0"
                        onClick={() => handleChat(user._id)}
                    >
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 ml-3">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-base font-medium text-gray-900 truncate">
                                    {user.name}
                                </h2>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                    {formatTime(user.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UsersList
