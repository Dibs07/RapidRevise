import { useEffect, useState } from "react";
import { Community } from "./schema";

export const useGetAllCommunity = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const [communities, setCommunities] = useState<Community[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const fetchCommunities = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${baseUrl}/community/`,{
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            //console.log(data);
            setCommunities(data.community);
        } catch (error) {
            setError(error as string);
        } finally {
            setIsLoading(false);
        }
    }   
    useEffect(() => {
        fetchCommunities();
    }, []);
    return { communities, isLoading, error, fetchCommunities };
}
