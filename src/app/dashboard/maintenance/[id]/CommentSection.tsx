'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Trash2 } from 'lucide-react'

export default function CommentSection({
  requestId,
  initialComments,
  userEmail,
}: {
  requestId: string
  initialComments: any[]
  userEmail: string
}) {
  const supabase = createClient()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setLoading(true)

    const { data, error } = await supabase
      .from('maintenance_request_comments')
      .insert({
        request_id: requestId,
        content: newComment.trim(),
        author_email: userEmail,
        author_name: userEmail,
      })
      .select()
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data])
      setNewComment('')
    }
    setLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Smazat komentář?')) return
    const { error } = await supabase
      .from('maintenance_request_comments')
      .delete()
      .eq('id', commentId)

    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId))
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          Komentáře ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">Zatím žádné komentáře</p>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">
                    {comment.author_name?.charAt(0).toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900">{comment.author_name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString('cs-CZ')} {new Date(comment.created_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {comment.author_email === userEmail && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-gray-100">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Napište komentář..."
            rows={2}
            className="flex-1 resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={loading || !newComment.trim()} size="sm" className="self-end">
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-400">Cmd+Enter pro odeslání</p>
      </CardContent>
    </Card>
  )
}