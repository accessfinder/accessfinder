'use client'

import type { SubmitEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function Page() {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log('success')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          name="feedback"
          placeholder="Tell us what you think..."
          className="min-h-32"
          required
        />
      </div>

      <Button type="submit">Submit feedback</Button>
    </form>
  )
}
