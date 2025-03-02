'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarCircles } from "@/components/ui/avatar-circles"

interface Participant {
  id?: string
  participant_id?: string
  profiles: {
    id?: string
    username: string
    avatar_url: string | null
  }
}

interface ParticipantAvatarsProps {
  participants: Participant[]
}

export default function ParticipantAvatars({ participants }: ParticipantAvatarsProps) {

  const maxAvatars = 7;
  
  return (
    <div className="flex -space-x-2 p-1 px-2 flex-wrap overflow-hidden">
      {participants.slice(0, maxAvatars).map((participant) => (
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
      {participants.length > maxAvatars && (
        <Avatar
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
        >
          <AvatarFallback>
            {`+${participants.length - maxAvatars}`}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
} 