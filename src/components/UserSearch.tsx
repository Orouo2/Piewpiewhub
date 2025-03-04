"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Type pour les résultats de recherche d'utilisateur
interface UserSearchResult {
  id: string;
  username: string;
  name?: string | null;
  image?: string | null;
}

const UserSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Effectuer la recherche d'utilisateurs
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim().length < 2) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/users/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: searchTerm }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la recherche');
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Erreur de recherche:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce pour éviter trop de requêtes
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Gérer la sélection d'un utilisateur
  const handleUserSelect = (user: UserSearchResult) => {
    router.push(`/profile/${user.username}`);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Search className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Rechercher un utilisateur</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command>
          <CommandInput 
            placeholder="Rechercher un utilisateur..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            ref={inputRef}
          />
          <CommandList>
            {isLoading && (
              <CommandEmpty>Recherche en cours...</CommandEmpty>
            )}
            
            {!isLoading && users.length === 0 && searchTerm.length > 1 && (
              <CommandEmpty>Aucun utilisateur trouvé</CommandEmpty>
            )}
            
            {users.length > 0 && (
              <CommandGroup heading="Résultats">
                {users.map((user) => (
                  <CommandItem 
                    key={user.id} 
                    value={user.name || user.username || ''}
                    onSelect={() => handleUserSelect(user)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.username} 
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 mr-3 text-gray-500" />
                      )}
                      <div>
                        <div className="font-medium">{user.name}</div>
                        {user.name && (
                          <div className="text-xs text-gray-500">{user.username}</div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UserSearch;