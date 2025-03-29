"use client"
import Link from "next/link"
import { Clock, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/context/context"
export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { login, isAuthenticated } = useAuth();
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <header className="border-b">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Clock className="h-6 w-6" />
                    <span className="hidden sm:inline">Rapid Revise</span>
                </Link>

                <nav className="hidden md:flex md:gap-4">
                    <Link href="/communities">
                        <Button variant="ghost" size="sm" className="sm:size-md">Communities</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="sm:size-md">Dashboard</Button>
                    </Link>
                    <Link href="/create">
                        <Button size="sm" className="sm:size-md">Create Plan</Button>
                    </Link>

                    {!isAuthenticated ? <Button variant="ghost" size="sm" className="sm:size-md" onClick={login}>Login</Button> :
                        <Link href="/profile">
                            <Button variant="ghost" size="sm" className="sm:size-md">Profile</Button>
                        </Link>}
                </nav>

                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
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
                        {!isAuthenticated ? <Button variant="ghost" size="sm" className="sm:size-md w-full justify-start" onClick={login}>Login</Button> :
                        <Link href="/profile">
                            <Button variant="ghost" size="sm" className="sm:size-md justify-start">Profile</Button>
                        </Link>}
                    </nav>
                </div>
            )}
        </header>
    )
}