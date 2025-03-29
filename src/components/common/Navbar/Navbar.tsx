"use client"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Clock, Menu, X, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const { login, logout, isAuthenticated, user } = useAuth()
    const dropdownRef = useRef(null)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <header className="border-b">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Clock className="h-6 w-6" />
                    <span className="hidden sm:inline">Rapid Revise</span>
                </Link>

                <nav className="hidden md:flex md:items-center md:gap-4">
                    <Link href="/communities">
                        <Button variant="ghost" size="sm" className="sm:size-md">Communities</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="sm:size-md">Dashboard</Button>
                    </Link>
                    <Link href="/create">
                        <Button size="sm" className="sm:size-md">Create Plan</Button>
                    </Link>

                    {!isAuthenticated ? (
                        <Button variant="ghost" size="sm" className="sm:size-md" onClick={login}>
                            Login
                        </Button>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={toggleDropdown}
                                className="flex items-center focus:outline-none"
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="true"
                            >
                                <Avatar className="h-8 w-8 cursor-pointer">
                                    <AvatarImage src={user?.profile_picture} />
                                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <Link 
                                        href="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                <div className="flex items-center md:hidden">
                    {isAuthenticated && (
                        <div className="relative mr-4" ref={dropdownRef}>
                            <button 
                                onClick={toggleDropdown}
                                className="flex items-center focus:outline-none"
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="true"
                            >
                                <Avatar className="h-8 w-8 cursor-pointer">
                                    <AvatarImage src={user?.profile_picture} />
                                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <Link 
                                        href="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
            
            {isMenuOpen && (
                <div className="md:hidden">
                    <nav className="flex flex-col border-t p-4">
                        <Link href="/communities" className="py-2">
                            <Button variant="ghost" size="sm" className="w-full justify-start">Communities</Button>
                        </Link>
                        <Link href="/dashboard" className="py-2">
                            <Button variant="ghost" size="sm" className="w-full justify-start">Dashboard</Button>
                        </Link>
                        <Link href="/create" className="py-2">
                            <Button size="sm" className="w-full justify-start">Create Plan</Button>
                        </Link>
                        {!isAuthenticated ? (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full justify-start" 
                                onClick={login}
                            >
                                Login
                            </Button>
                        ) : (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full justify-start text-red-500"
                                onClick={logout}
                            >
                                Logout
                            </Button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}