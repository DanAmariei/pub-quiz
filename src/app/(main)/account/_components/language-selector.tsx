'use client'

import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

const languages = [
  { code: 'ro', name: 'Română' },
  { code: 'en', name: 'English' },
] as const

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const supabase = createClient()

  useEffect(() => {
    // Încarcă preferința de limbă din profil la montarea componentei
    async function loadLanguagePreference() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .single()

        if (profile?.language) {
          i18n.changeLanguage(profile.language)
        }
      }
    }

    loadLanguagePreference()
  }, [])

  async function handleLanguageChange(value: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Actualizează preferința în baza de date
      await supabase
        .from('profiles')
        .update({ language: value })
        .eq('id', user.id)

      // Schimbă limba în aplicație
      i18n.changeLanguage(value)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Limbă</label>
      <Select
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selectează limba" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 