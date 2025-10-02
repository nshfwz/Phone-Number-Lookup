"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Contact = {
  id?: number;
  name: string;
  phone?: string;
  country?: string;
  province?: string;
  city?: string;
  street?: string;
  address?: string;
};

export default function ContactDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', country: '', province: '', city: '', street: '' });

  useEffect(() => {
    if (!id) return;
    const fetchContact = async () => {
      try {
        const res = await fetch(`/api/contacts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setContact(data);
          setForm({
            name: data.name ?? '',
            phone: data.phone ?? '',
            country: data.country ?? '',
            province: data.province ?? '',
            city: data.city ?? '',
            street: data.street ?? ''
          });
        } else {
          // Not found or error
          setContact(null);
        }
      } catch {
        setContact(null);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id]);

  const save = async () => {
    if (!contact?.id) return;
    const payload = {
      name: form.name,
      phone: form.phone,
      country: form.country,
      province: form.province,
      city: form.city,
      street: form.street
    };
    const res = await fetch(`/api/contacts/${contact.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const updated = await res.json();
      setContact(updated);
      setEditing(false);
    } else {
      // Optional: show error feedback
    }
  };

  const handleDelete = async () => {
    if (!contact?.id) return;
    console.log('Deleting contact id:', contact?.id);
    const confirmed = window.confirm('确定要删除此联系人吗？');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: 'DELETE'
      });
      if (res.status === 204) {
        router.push('/');
      } else if (res.status === 404) {
        alert('未找到联系人，可能已被删除');
      } else {
        const text = await res.text();
        console.error('Delete failed, status:', res.status, 'response:', text);
        alert('删除失败，请稍后重试');
      }
    } catch (e) {
      console.error('Delete request error:', e);
      alert('删除失败，请稍后重试');
    }
  };

  if (loading) {
    return <div style={{ padding: 20, color: '#fff' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.back()} style={{ marginBottom: 12 }}>返回</button>

      {contact ? (
        <div style={{ maxWidth: 860, margin: '0 auto', background: '#111', padding: 20, borderRadius: 12, color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>{editing ? '编辑联系人' : contact.name}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing((e) => !e)} style={{ padding: '8px 12px', borderRadius: 6 }}>编辑</button>
              <button onClick={handleDelete} style={{ padding: '8px 12px', borderRadius: 6, background: '#a00', color: '#fff', border: '1px solid #700' }}>删除</button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <div>
              <div style={{ color: '#aaa', fontSize: 12 }}>姓名</div>
              {editing ? (
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              ) : (
                <div>{contact.name}</div>
              )}
            </div>

            <div>
              <div style={{ color: '#aaa', fontSize: 12 }}>电话</div>
              {editing ? (
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              ) : (
                <div>{contact.phone ?? ''}</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ color: '#aaa', fontSize: 12 }}>国家</div>
                {editing ? (
                  <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={inputStyle} />
                ) : (
                  <div>{contact.country ?? ''}</div>
                )}
              </div>
              <div>
                <div style={{ color: '#aaa', fontSize: 12 }}>省份</div>
                {editing ? (
                  <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} style={inputStyle} />
                ) : (
                  <div>{contact.province ?? ''}</div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ color: '#aaa', fontSize: 12 }}>城市</div>
                {editing ? (
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} />
                ) : (
                  <div>{contact.city ?? ''}</div>
                )}
              </div>
              <div>
                <div style={{ color: '#aaa', fontSize: 12 }}>街道</div>
                {editing ? (
                  <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} style={inputStyle} />
                ) : (
                  <div>{contact.street ?? ''}</div>
                )}
              </div>
            </div>

            <div>
              <div style={{ color: '#aaa', fontSize: 12 }}>地址</div>
              <div>{contact.address ?? ''}</div>
            </div>
          </div>

          {editing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
              <button onClick={() => setEditing(false)} style={buttonStyle}>取消</button>
              <button onClick={save} style={buttonStyle}>保存</button>
            </div>
          )}
        </div>
      ) : (
        <div>未找到联系人</div>
      )}
    </div>
  );
}

// Inline styles to keep file self-contained
const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, borderRadius: 6, padding: '0 10px',
  background: '#222', color: '#fff', border: '1px solid #333'
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 6, border: '1px solid #333', background: '#333', color: '#fff'
};
