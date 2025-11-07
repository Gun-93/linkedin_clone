import { useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'


export default function PostComposer({ onPosted }) {
    const [content, setContent] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()


    const submit = async (e) => {
        e.preventDefault()
        if (!content.trim() && !file) return
        setLoading(true)
        try {
            const form = new FormData()
            form.append('content', content)
            if (file) form.append('image', file)
            await api.post('/api/posts', form, { headers: { 'Content-Type': 'multipart/form-data' } })
            setContent('')
            setFile(null)
            onPosted?.()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border p-4">
            <form onSubmit={submit} className="space-y-3">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'there'}?`}
                    className="w-full resize-none min-h-[90px] outline-none"/>
                <div className="flex items-center justify-between">
                    <label className="text-sm cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        <span className="px-3 py-1.5 rounded border bg-gray-50 hover:bg-gray-100">{file ? 'Change image' : 'Add image'}</span>
                    </label>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">
                        {loading ? 'Posting…' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    )
}