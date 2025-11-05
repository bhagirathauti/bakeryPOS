import React, { useState, useEffect } from 'react'

export default function ShopProfile({ onProfileChange, user, lastSavedProfile }) {
  const [shopName, setShopName] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [profilePic, setProfilePic] = useState(null) // base64
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Always fetch profile from server for the current user
    async function load() {
      const API_BASE = window.__API_BASE__ || 'http://localhost:4000'
      if (user && user.id) {
        try {
          const res = await fetch(`${API_BASE}/api/shop/profile?userId=${user.id}`)
          if (res.ok) {
            const data = await res.json()
            if (data && (data.shopName || data.mobile || data.address || data.ownerName)) {
              // Use camelCase keys from Prisma response
              setShopName(data.shopName || '')
              setMobile(data.mobile || '')
              setAddress(data.address || '')
              setOwnerName(data.ownerName || '')
              setProfilePic(data.profilePic || null)
              onProfileChange && onProfileChange({
                id: data.id,
                shopName: data.shopName || '',
                mobile: data.mobile || '',
                address: data.address || '',
                ownerName: data.ownerName || '',
                profilePic: data.profilePic || null
              })
            } else {
              // No profile data found - reset to empty
              setShopName('')
              setMobile('')
              setAddress('')
              setOwnerName('')
              setProfilePic(null)
              onProfileChange && onProfileChange(null)
            }
          }
        } catch (e) {
          console.error('Failed to fetch profile:', e)
          // Reset to empty on error
          setShopName('')
          setMobile('')
          setAddress('')
          setOwnerName('')
          setProfilePic(null)
          onProfileChange && onProfileChange(null)
        }
      }
    }
    load()
  }, [user])

  function handleFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProfilePic(reader.result)
    reader.readAsDataURL(file)
  }

  // Helper: compare current profile to last saved
  function isChanged() {
    if (!lastSavedProfile) return true;
    return (
      shopName !== (lastSavedProfile.shopName || '') ||
      mobile !== (lastSavedProfile.mobile || '') ||
      address !== (lastSavedProfile.address || '') ||
      ownerName !== (lastSavedProfile.ownerName || '') ||
      profilePic !== (lastSavedProfile.profilePic || null)
    );
  }

  async function save(e) {
    e && e.preventDefault()
    setError('')
    setSuccess('')
    // Validation
    if (!shopName || !mobile || !address || !ownerName) {
      setError('Please fill all fields to complete the shop profile.')
      return
    }
    if (!/^\d{10,15}$/.test(mobile)) {
      setError('Mobile number must be 10-15 digits.')
      return
    }
    if (address.length < 5) {
      setError('Address must be at least 5 characters.')
      return
    }
    const obj = { shopName, mobile, address, ownerName, profilePic }

    // If user present, persist to server, otherwise localStorage
    if (user && user.id) {
      try {
        const API_BASE = window.__API_BASE__ || 'http://localhost:4000'
        const res = await fetch(`${API_BASE}/api/shop/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, shopName, mobile, address, ownerName, profilePic })
        })
        if (!res.ok) throw new Error('server')
        onProfileChange && onProfileChange(obj)
        setSuccess('Profile saved successfully!')
        return
      } catch (e) {
        setError('Failed to save profile. Please try again.')
        return
      }
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shop Profile</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your shop information and settings</p>
      </div>

      <form onSubmit={save} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile Picture Section */}
          <div className="lg:col-span-1 flex flex-col items-center justify-start space-y-4 p-6 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="relative group">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt="Shop profile" 
                  className="h-32 w-32 rounded-full object-cover border-4 border-amber-500 shadow-lg" 
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center border-4 border-amber-500 shadow-lg">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 text-center">
                Shop Logo / Profile Picture
              </label>
              <label className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 rounded-lg border-2 border-dashed border-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Choose Image</span>
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">PNG, JPG up to 5MB</p>
            </div>
          </div>

          {/* Right: Form Fields */}
          <div className="lg:col-span-2 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input 
                  value={shopName} 
                  onChange={e => setShopName(e.target.value)} 
                  placeholder="e.g., Sweet Delights Bakery"
                  className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input 
                  value={mobile} 
                  onChange={e => setMobile(e.target.value)} 
                  placeholder="10-15 digits"
                  className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                Owner Name <span className="text-red-500">*</span>
              </label>
              <input 
                value={ownerName} 
                onChange={e => setOwnerName(e.target.value)} 
                placeholder="Full name of the shop owner"
                className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                Shop Address <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                placeholder="Enter complete shop address with landmark"
                className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none" 
                rows={3} 
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Footer */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-slate-700">
          <button 
            type="button" 
            onClick={() => {
              setShopName(''); setMobile(''); setAddress(''); setOwnerName(''); setProfilePic(null); setError(''); setSuccess('');
            }} 
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium transition-colors"
          >
            Reset Form
          </button>
          
          <button
            type="submit"
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              isChanged() 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg' 
                : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isChanged()}
          >
            {isChanged() ? 'Save Profile' : 'No Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
