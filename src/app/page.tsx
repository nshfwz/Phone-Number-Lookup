"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';

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

export default function HomePage() {
  const [query, setQuery] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', country: '', province: '', city: '', street: '' });
  const [loading, setLoading] = useState(false);

  const fetchContacts = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/contacts?q=${encodeURIComponent(q)}` : '/api/contacts';
      const res = await fetch(url);
      const data = await res.json();
      // ensure array
      setContacts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(undefined); }, [fetchContacts]);

  useEffect(() => {
    const t = setTimeout(() => fetchContacts(query || undefined), 300);
    return ()=>clearTimeout(t);
  }, [query, fetchContacts]);

  const groups = useMemo(() => {
    const map = new Map<string, Contact[]>();
    contacts.forEach((c) => {
      const first = (c.name?.trim()[0] ?? '').toUpperCase();
      const letter = /[A-Z]/.test(first) ? first : '#';
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(c);
    });
    const arr = Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0]));
    arr.forEach(([_, list]) => list.sort((a,b) => a.name.localeCompare(b.name)));
    return arr.map(([letter, items]) => ({ letter, items }));
  }, [contacts]);

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`group-${letter}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const initialNameRef = useRef<HTMLInputElement | null>(null);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.name.trim()) return;
    const payload = { ...form };
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const created = await res.json();
    if (res.ok) {
      setContacts((cs) => [...cs, created]);
      setModalOpen(false);
      setForm({ name: '', phone: '', country: '', province: '', city: '', street: '' });
    }
  };

  // Focus when modal opens
  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => initialNameRef.current?.focus(), 0);
    }
  }, [modalOpen]);

  return (
    <div style={{ padding: 16, background: '#000', minHeight: '100vh', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>联系人</h1>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, gap: 8 }}>
        <input
          placeholder="搜索联系人"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 20,
            padding: '0 14px',
            border: '1px solid #333',
            background: '#111',
            color: '#fff'
          }}
        />
      </div>

      <div style={{ display: 'flex', marginTop: 12, height: '66vh', overflow: 'auto' }}>
        <div style={{ flex: 1 }}>
          {groups.map((g) => (
            <section key={g.letter} id={`group-${g.letter}`} style={{ marginBottom: 12 }}>
              <h3 style={{ margin: '8px 0', color: '#ddd' }}>{g.letter}</h3>
              {g.items.map((c) => (
                <Link key={c.id} href={`/contacts/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
                    borderRadius: 12, background: '#111', margin: '6px 0'
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 20, background: '#2a2a2a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600
                    }}>
                      {c.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                      <span style={{ color: '#aaa', fontSize: 12 }}>
                        {c.phone ?? ''}{c.phone && c.city ? ' • ' : ''}{c.city ?? ''}
                      </span>
                    </div>
                    <div style={{ marginLeft: 'auto', color: '#888' }}>›</div>
                  </div>
                </Link>
              ))}
            </section>
          ))}
        </div>
      </div>

      <div style={{
        position: 'fixed', right: 40, bottom: 20,
        width: 60, height: 60, borderRadius: 30,
        background: '#00b894', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 28, cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,.4)'
      }} onClick={() => setModalOpen(true)} aria-label="Add contact">
        +
      </div>

      <div
        aria-label="alphabet-nav"
        style={{
          position: 'fixed',
          right: 8,
          top: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6
        }}
      >
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').map((ch) => (
          <button key={ch} onClick={() => scrollToLetter(ch)}
            style={{ background: 'transparent', border: 'none', color: '#bbb', cursor: 'pointer', padding: 2, fontSize: 12 }}>
            {ch}
          </button>
        ))}
      </div>

      {modalOpen && (
        <div role="dialog" aria-label="Add contact" style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setModalOpen(false)}>
          <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} style={{
            width: 420, background: '#111', padding: 20, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.5)', color: '#fff'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>添加联系人</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <input ref={initialNameRef} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="姓名" required style={{ height: 38, borderRadius: 6, padding: '0 10px', background: '#222', color: '#fff', border: '1px solid #333' }} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="电话" style={{ height: 38, borderRadius: 6, padding: '0 10px', background: '#222', color: '#fff', border: '1px solid #333' }} />
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="国家" style={{ height: 38, borderRadius: 6, padding: '0 10px', background: '#222', color: '#fff', border: '1px solid #333' }} />
              <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="省份" style={{ height: 38, borderRadius: 6, padding: '0 10px', background: '#222', color: '#fff', border: '1px solid #333' }} />
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="城市" style={{ height: 38, borderRadius: 6, padding: '0 10px', background: '#222', color: '#fff', border: '1px solid #333' }} />
              <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="街道" style={{ height: 38, borderRadius: 6, padding: '0 10px', background: '#222', color: '#fff', border: '1px solid #333' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #333', background: '#333', color: '#fff' }}>
                取消
              </button>
              <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0f5132', background: '#0f5132', color: '#fff' }}>
                保存
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
