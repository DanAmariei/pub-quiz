'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Participant {
  id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface ParticipantAvatarsProps {
  participants: Participant[]
}

export default function ParticipantAvatars({ participants }: ParticipantAvatarsProps) {
  return (
    <div className="flex -space-x-2 p-1 px-2 flex-wrap justify-center overflow-hidden">
      {participants.map((participant) => (
        <Avatar
          key={participant.id}
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
        >
          <AvatarImage
            src={participant.profiles.avatar_url || ''}
            alt={participant.profiles.username}
          />
          <AvatarFallback>
            {participant.profiles.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
} 