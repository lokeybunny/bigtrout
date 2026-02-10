import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ListingLogo {
  id: string;
  name: string;
  logo_url: string;
  link_url: string;
  alt_text: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  // Auth form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);

  // Listing management
  const [logos, setLogos] = useState<ListingLogo[]>([]);
  const [logosLoading, setLogosLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [newOrder, setNewOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [editOrder, setEditOrder] = useState(0);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (session) checkAdminRole(session.user.id);
      else { setIsAdmin(false); setCheckingRole(false); }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) checkAdminRole(session.user.id);
    });
  }, []);

  const checkAdminRole = async (userId: string) => {
    setCheckingRole(true);
    // has_role is a security definer function not in generated types
    const { data } = await (supabase as any).rpc('has_role', { _user_id: userId, _role: 'admin' });
    setIsAdmin(!!data);
    setCheckingRole(false);
    if (data) fetchLogos();
  };

  const fetchLogos = async () => {
    setLogosLoading(true);
    const { data, error } = await supabase
      .from('listing_logos')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data) setLogos(data as ListingLogo[]);
    setLogosLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Check your email', description: 'Verify your email to complete signup.' });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    const ext = selectedFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    setUploading(true);
    const { error } = await supabase.storage.from('listing-logos').upload(fileName, selectedFile);
    setUploading(false);
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return null;
    }
    const { data: urlData } = supabase.storage.from('listing-logos').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleAddLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLink) {
      toast({ title: 'Missing fields', description: 'Name and link are required.', variant: 'destructive' });
      return;
    }
    let logoUrl = '';
    if (selectedFile) {
      const url = await uploadLogo();
      if (!url) return;
      logoUrl = url;
    } else {
      toast({ title: 'No logo', description: 'Please upload a logo image.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('listing_logos').insert({
      name: newName,
      logo_url: logoUrl,
      link_url: newLink,
      alt_text: newAlt || `Trade BIGTROUT on ${newName}`,
      display_order: newOrder,
      created_by: session.user.id,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Added!', description: `${newName} logo added to listings.` });
      setNewName(''); setNewLink(''); setNewAlt(''); setNewOrder(0);
      setSelectedFile(null); setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchLogos();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} from listings?`)) return;
    const { error } = await supabase.from('listing_logos').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted', description: `${name} removed.` }); fetchLogos(); }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase.from('listing_logos').update({ is_active: !currentActive }).eq('id', id);
    if (!error) fetchLogos();
  };

  const startEdit = (logo: ListingLogo) => {
    setEditId(logo.id);
    setEditName(logo.name);
    setEditLink(logo.link_url);
    setEditAlt(logo.alt_text || '');
    setEditOrder(logo.display_order);
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    const { error } = await supabase.from('listing_logos').update({
      name: editName,
      link_url: editLink,
      alt_text: editAlt,
      display_order: editOrder,
    }).eq('id', editId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Updated!' }); setEditId(null); fetchLogos(); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1525] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Not logged in — show login form
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a1525] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Bangers, cursive', color: '#44ff88' }}>
            🐟 BIGTROUT ADMIN
          </h1>
          <p className="text-center text-gray-400 text-sm mb-8">Manage listing logos & links</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#44ff88]/50" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#44ff88]/50" />
            </div>
            <button type="submit" disabled={authLoading}
              className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ fontFamily: 'Bangers', background: 'linear-gradient(135deg, #1a6b3a, #44ff88)', color: '#0a1525', letterSpacing: '0.1em' }}>
              {authLoading ? '...' : authMode === 'login' ? '🔑 LOGIN' : '📝 SIGN UP'}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="w-full text-center mt-4 text-sm text-gray-500 hover:text-gray-300">
            {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
          <a href="/" className="block text-center mt-6 text-sm text-gray-600 hover:text-gray-400">← Back to home</a>
        </div>
      </div>
    );
  }

  // Logged in but checking role
  if (checkingRole) {
    return (
      <div className="min-h-screen bg-[#0a1525] flex items-center justify-center">
        <div className="text-white text-xl">Checking permissions...</div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a1525] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Bangers' }}>ACCESS DENIED</h1>
          <p className="text-gray-400 mb-6">Your account does not have admin privileges.</p>
          <p className="text-gray-500 text-xs mb-4">Logged in as: {session.user.email}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleLogout} className="px-6 py-2 rounded-lg bg-red-900/50 text-red-300 border border-red-700/50 hover:bg-red-900/80">
              Logout
            </button>
            <a href="/" className="px-6 py-2 rounded-lg bg-black/50 text-gray-400 border border-white/10 hover:bg-black/80">Home</a>
          </div>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-[#0a1525] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Bangers, cursive', color: '#44ff88' }}>🐟 BIGTROUT ADMIN</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">{session.user.email}</span>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg text-sm bg-red-900/30 text-red-300 border border-red-700/30 hover:bg-red-900/60">
            Logout
          </button>
          <a href="/" className="px-4 py-2 rounded-lg text-sm bg-black/50 text-gray-400 border border-white/10 hover:bg-black/80">Home</a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Add new logo */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Bangers', color: '#ffcc44' }}>➕ Add New Listing Logo</h2>
          <form onSubmit={handleAddLogo} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Exchange Name *</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. BitMart"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#44ff88]/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Trade Link *</label>
                <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#44ff88]/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Alt Text (optional)</label>
                <input type="text" value={newAlt} onChange={e => setNewAlt(e.target.value)} placeholder="Trade BIGTROUT on..."
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#44ff88]/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Display Order</label>
                <input type="number" value={newOrder} onChange={e => setNewOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#44ff88]/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Logo Image *</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#44ff88]/20 file:text-[#44ff88] file:font-bold file:text-sm" />
              {previewUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={previewUrl} alt="Preview" className="h-12 w-auto object-contain rounded bg-white/10 p-1" />
                  <span className="text-xs text-gray-500">{selectedFile?.name}</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={uploading}
              className="px-8 py-3 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ fontFamily: 'Bangers', background: 'linear-gradient(135deg, #1a6b3a, #44ff88)', color: '#0a1525', letterSpacing: '0.08em' }}>
              {uploading ? 'Uploading...' : '🚀 ADD LOGO'}
            </button>
          </form>
        </div>

        {/* Current logos */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Bangers', color: '#ffcc44' }}>
            📋 Current DB Listings ({logos.length})
          </h2>
          <p className="text-xs text-gray-500 mb-4">Note: Hardcoded logos in code are always shown. These are additional logos managed by admins.</p>
          
          {logosLoading ? (
            <div className="text-gray-400">Loading...</div>
          ) : logos.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No admin-managed logos yet. Add one above!</div>
          ) : (
            <div className="space-y-3">
              {logos.map(logo => (
                <div key={logo.id} className="flex items-center gap-4 p-3 rounded-lg border border-white/5 bg-black/20">
                  <img src={logo.logo_url} alt={logo.name} className="h-10 w-16 object-contain rounded bg-white/5 p-1 flex-shrink-0" />
                  
                  {editId === logo.id ? (
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="px-2 py-1 rounded bg-black/50 border border-white/10 text-white text-sm" />
                      <input value={editLink} onChange={e => setEditLink(e.target.value)} className="px-2 py-1 rounded bg-black/50 border border-white/10 text-white text-sm" />
                      <input value={editAlt} onChange={e => setEditAlt(e.target.value)} placeholder="Alt text" className="px-2 py-1 rounded bg-black/50 border border-white/10 text-white text-sm" />
                      <input type="number" value={editOrder} onChange={e => setEditOrder(parseInt(e.target.value) || 0)} className="px-2 py-1 rounded bg-black/50 border border-white/10 text-white text-sm" />
                      <div className="col-span-2 flex gap-2">
                        <button onClick={handleSaveEdit} className="px-3 py-1 rounded bg-[#44ff88]/20 text-[#44ff88] text-sm font-bold hover:bg-[#44ff88]/30">Save</button>
                        <button onClick={() => setEditId(null)} className="px-3 py-1 rounded bg-white/5 text-gray-400 text-sm hover:bg-white/10">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{logo.name}</div>
                        <div className="text-xs text-gray-500 truncate">{logo.link_url}</div>
                      </div>
                      <div className="text-xs text-gray-600">#{logo.display_order}</div>
                      <button onClick={() => handleToggleActive(logo.id, logo.is_active)}
                        className={`px-2 py-1 rounded text-xs font-bold ${logo.is_active ? 'bg-green-900/30 text-green-400 border border-green-700/30' : 'bg-red-900/30 text-red-400 border border-red-700/30'}`}>
                        {logo.is_active ? 'Active' : 'Hidden'}
                      </button>
                      <button onClick={() => startEdit(logo)} className="px-2 py-1 rounded text-xs bg-blue-900/30 text-blue-400 border border-blue-700/30 hover:bg-blue-900/50">Edit</button>
                      <button onClick={() => handleDelete(logo.id, logo.name)} className="px-2 py-1 rounded text-xs bg-red-900/30 text-red-400 border border-red-700/30 hover:bg-red-900/50">Delete</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
