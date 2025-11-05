import React from 'react'
import Footer from '../components/Footer';


export default function Landing({ theme, toggleTheme, onGetStarted }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/20">SS</div>
              <div>
                <div className="text-xl font-bold tracking-tight">SaleSync</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 tracking-wide">POS · Inventory · Billing</div>
              </div>
            </div>
            <nav className="flex items-center gap-6 sm:gap-8">
              <a className="hidden sm:inline-block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60" href="#features">Features</a>
              <a className="hidden sm:inline-block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60" href="#pricing">Pricing</a>
              <a className="hidden sm:inline-block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60" href="#contact">Contact</a>
              <div className="hidden sm:flex items-center gap-3 pl-6 ml-2 border-l border-gray-200 dark:border-slate-700">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-lg"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button onClick={onGetStarted} className="px-6 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 shadow-md hover:shadow-lg transition-all duration-200">Get Started</button>
              </div>
              {/* Mobile CTA */}
              <button onClick={onGetStarted} className="sm:hidden px-5 py-2 bg-amber-500 text-white text-sm font-medium rounded-full shadow-md">Start</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-6">
                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full">Built for all businesses</span>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                  Simplify your<br />
                  <span className="text-amber-500">business sales</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Fast, modern point of sale with inventory management, WhatsApp bill sending, loyalty points and interactive sales dashboards — perfect for retail, restaurants, bakeries, and more.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={onGetStarted} className="px-8 py-4 bg-amber-500 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-200">
                  Start free trial
                </button>
                <a className="px-8 py-4 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:border-amber-500 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-all duration-200" href="#features">
                  See features
                </a>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-2xl flex-shrink-0">✓</div>
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">Easy setup</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">Start in minutes</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-2xl flex-shrink-0">⚡</div>
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">Fast checkout</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">Optimized for speed</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Live Dashboard</h3>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="h-80 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center border border-amber-100 dark:border-slate-600">
                  <div className="text-center space-y-3 px-6">
                    <div className="text-5xl">📊</div>
                    <div className="font-semibold text-amber-700 dark:text-amber-300">Interactive Sales Dashboard</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Real-time insights & analytics</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-50 dark:bg-slate-900/50 py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-16 space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Powerful features</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Everything you need to sell faster, keep stock in check, and delight customers.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Inventory', desc: 'Track stock levels and low-stock alerts.', icon: '📦' },
                { title: 'Billing', desc: 'Print or share bills instantly.', icon: '🧾' },
                { title: 'Loyalty', desc: 'Reward repeat customers with points.', icon: '⭐' },
                { title: 'Reports', desc: 'Visual dashboards and sales insights.', icon: '📈' },
                { title: 'Cashiers', desc: 'Role-based access and quick checkout.', icon: '👥' },
                { title: 'Cloud Backup', desc: 'Your data is safe and synced.', icon: '☁️' },
              ].map((f) => (
                <div key={f.title} className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl mb-5">{f.icon}</div>
                  <div className="space-y-2">
                    <div className="font-bold text-lg">{f.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-16 text-center space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Simple, transparent pricing</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Choose the plan that fits your business size and needs.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Monthly Plan */}
              <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Monthly</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Perfect for getting started</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-amber-600">₹499</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Billed monthly</p>
                  </div>

                  <button onClick={onGetStarted} className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all">
                    Start Monthly Plan
                  </button>

                  <div className="pt-6 space-y-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Single location</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Up to 5 cashiers</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Inventory management</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sales analytics</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">WhatsApp billing</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email support</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yearly Plan - Popular */}
              <div className="group bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl border-2 border-amber-400 dark:border-amber-500 transition-all duration-300 hover:-translate-y-2 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Yearly</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Save 17% with annual billing</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-amber-600">₹4,999</span>
                      <span className="text-gray-500 dark:text-gray-400">/year</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      <span className="line-through">₹5,988</span> · Save ₹989/year
                    </p>
                  </div>

                  <button onClick={onGetStarted} className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Start Yearly Plan
                  </button>

                  <div className="pt-6 space-y-4 border-t border-amber-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Everything in Monthly, plus:</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Up to 10 cashiers</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Priority support</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Advanced reports</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Data export (CSV/PDF)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">API access</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Plan for Food Chains */}
              <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Enterprise</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">For food chains & franchises</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">Custom</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Tailored to your needs</p>
                  </div>

                  <a href="mailto:support@salesync.app" className="block w-full px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-xl shadow-md hover:shadow-lg transition-all text-center">
                    Contact Sales
                  </a>

                  <div className="pt-6 space-y-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Everything in Yearly, plus:</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Multiple locations</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Unlimited cashiers</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Central dashboard</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Custom integrations</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dedicated support</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">On-site training</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-12 border border-amber-100 dark:border-slate-700 text-center space-y-6">
              <h3 className="text-3xl font-bold">Get in touch</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">Have questions? We'd love to help you get started with SaleSync.</p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <a className="px-8 py-4 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 rounded-xl font-medium hover:border-amber-500 transition-colors" href="mailto:support@salesync.app">
                  Email support
                </a>
                <button onClick={onGetStarted} className="px-8 py-4 bg-amber-500 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-all">
                  Get started
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  )
}