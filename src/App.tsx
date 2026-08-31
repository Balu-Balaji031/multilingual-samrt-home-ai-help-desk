import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Activity, ArrowRight, Bell, Bot, Camera, Check, ChevronLeft, Eye, EyeOff, Headphones, Home, ImagePlus, Lightbulb, LockKeyhole, LogOut, Menu, MessageCircle, Mic, MoreHorizontal, Plus, Search, Settings, ShieldCheck, Sparkles, Ticket, UserRound, Wrench, X, Zap } from 'lucide-react'
import { findCustomerAccount, generateResetCode, login, register, updateCustomerPassword } from './api/authApi'
import { activeTicket, completedTickets, devices, mockCustomerProfile as customer, recentActivity } from './mocks/customerData'
import { addCustomerDevice, updateCustomerProfile } from './api/customerApi'
import { createServiceTicket } from './api/ticketApi'
import type { CustomerProfile } from './mocks/customerData'
import type { UserRole } from './types/auth'
import { deviceCatalog, deviceCategories, type CatalogDevice, type DeviceCategory } from './mocks/deviceCatalog'
import { customerNotifications, type NotificationType } from './mocks/notificationData'
import type { TechnicianProfile } from './mocks/technicianData'
import { technicianLanguages, technicianRadiusOptions, technicianSpecializations, technicianWorkingDays, specializationSkills } from './mocks/technicianSkills'
import { updateTechnicianProfile } from './api/technicianApi'
import { useMockStore } from './services/mockStore'
import { AdminPortal } from './components/admin/AdminPortal'
import { TechnicianDashboard } from './components/technician/TechnicianDashboard'
import { TechnicianJobsList } from './components/technician/TechnicianJobsList'
import { TechnicianJobDetails } from './components/technician/TechnicianJobDetails'
import { TechnicianSettingsPage } from './components/technician/TechnicianSettingsPage'
import './App.css'

const roles: Record<UserRole, { label: string; title: string; description: string; icon: typeof UserRound }> = {
  customer: { label: 'Customer', title: 'Welcome back', description: 'Manage your devices, troubleshoot problems, and track service requests.', icon: UserRound },
  electrician: { label: 'Technician', title: 'Technician Portal', description: 'Manage assigned jobs, service requests, and your technician profile.', icon: Wrench },
  admin: { label: 'Admin', title: 'Admin Portal', description: 'Manage users, technician verification, and platform operations.', icon: ShieldCheck },
}

function App() { return <BrowserRouter><Routes><Route path="/login" element={<Login />} /><Route path="/admin/login" element={<Login />} /><Route path="/register/:role" element={<Registration />} /><Route path="/verify/:role" element={<StatusPage />} /><Route path="/technician/verification" element={<StatusPage />} /><Route path="/customer/*" element={<CustomerPortal />} /><Route path="/ai-troubleshooting-history" element={<Navigate to="/customer/ai-troubleshooting-history" replace />} /><Route path="/forgot-password" element={<UtilityPage />} /><Route path="/reset-password" element={<UtilityPage reset />} /><Route path="/technician/*" element={<TechnicianPortal />} /><Route path="/admin/customers" element={<AdminPortal defaultTab="customers" />} /><Route path="/admin/settings" element={<AdminPortal defaultTab="settings" />} /><Route path="/admin/*" element={<AdminPortal />} /><Route path="/electrician/dashboard" element={<Navigate to="/technician/dashboard" replace />} /><Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes></BrowserRouter> }

function PublicShell({ children, back = false }: { children: ReactNode; back?: boolean }) { return <div className="portal"><header className="topbar"><Link className="brand" to="/login"><span className="brand-mark"><Sparkles size={18} /></span><span><strong>SmartAssist AI</strong><small>Smart Home Support Platform</small></span></Link>{back ? <Link className="back-link" to="/login"><ChevronLeft size={16} /> Back to login</Link> : <button className="support-link" type="button"><Headphones size={16} /> Help / Support</button>}</header>{children}<footer className="page-footer">2026 SmartAssist AI <span>•</span> Support for every connected home</footer></div> }

function Login() { const location = useLocation(); const navigate = useNavigate(); const [role, setRole] = useState<UserRole>(location.pathname.startsWith('/admin') ? 'admin' : 'customer'); const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState(''); const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const copy = roles[role]; const submit = async (event: FormEvent) => { event.preventDefault(); if (!identifier || !password) return setMessage('Enter your email or mobile number and password.'); setBusy(true); const result = await login(role, identifier, password); setBusy(false); navigate(result.role === 'electrician' ? '/technician/dashboard' : `/${result.role}/dashboard`) }; return <PublicShell><main className="auth-layout"><section className="intro-panel"><span className="eyebrow"><span className="pulse-dot" /> SMART HOME SUPPORT</span><h1>Diagnose smarter.<br /><em>Get help faster.</em></h1><p>One calm place to troubleshoot devices, connect with trusted technicians, and keep your home running beautifully.</p></section><section className="auth-card"><div className="card-heading"><span className="role-icon"><copy.icon size={21} /></span><div><h2>{copy.title}</h2><p>{copy.description}</p></div></div><div className="role-control" role="tablist" aria-label="Login as">{(['customer', 'electrician', 'admin'] as UserRole[]).map((item) => <button key={item} type="button" role="tab" aria-selected={role === item} className={role === item ? 'selected' : ''} onClick={() => { setRole(item); navigate(item === 'admin' ? '/admin/login' : '/login') }}>{roles[item].label}</button>)}</div><form className="auth-form" onSubmit={submit}><Field label="Email or Mobile Number" value={identifier} onChange={setIdentifier} placeholder="you@example.com" /><div className="field"><label htmlFor="login-password">Password</label><div className="password-wrap"><input id="login-password" type={show ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button className="icon-button" type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>{message && <p className="form-message" role="alert">{message}</p>}<div className="form-actions"><Link to="/forgot-password">Forgot password?</Link></div><button className="primary-button" disabled={busy}>{busy ? 'Signing in...' : 'Login'} {!busy && <ArrowRight size={17} />}</button></form>{role === 'admin' ? <div className="admin-note"><LockKeyhole size={16} /> Authorized administrators only. No public registration.</div> : <div className="register-prompt"><span>{role === 'customer' ? "Don't have an account?" : 'New to SmartAssist?'}</span><Link to={`/register/${role === 'electrician' ? 'technician' : role}`}>{role === 'customer' ? 'Create Customer Account' : 'Register as Technician'}</Link></div>}</section></main></PublicShell> }

function Field({ label, value, onChange, placeholder, type = 'text', required = false, inputMode }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; required?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'] }) { const id = label.toLowerCase().replaceAll(' ', '-'); return <div className="field"><label htmlFor={id}>{label}{required ? ' *' : ''}</label><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} inputMode={inputMode} /></div> }

function Registration() { const { role = 'customer' } = useParams<{ role: 'customer' | 'electrician' }>(); const isCustomer = role === 'customer'; const steps = isCustomer ? ['Account', 'Contact / Location', 'Preferences', 'Review', 'Verify'] : ['Account', 'Professional', 'Service Area', 'Review']; const [step, setStep] = useState(1); const [data, setData] = useState<Record<string, string>>({}); const [error, setError] = useState(''); const update = (key: string) => (value: string) => setData((current) => ({ ...current, [key]: value })); const submit = async (event: FormEvent) => { event.preventDefault(); if (step === 1 && (!data.name || !data.email || !data.mobile || !data.password || !data.confirm)) return setError('Please complete all required account fields.'); if (step === 1 && data.password !== data.confirm) return setError('Passwords do not match.'); setError(''); if (step < steps.length) return setStep(step + 1); await register(role); window.location.href = isCustomer ? '/verify/customer' : '/technician/verification' }; const f = (label: string, key: string, placeholder: string, type = 'text') => <Field label={label} value={data[key] || ''} onChange={update(key)} placeholder={placeholder} type={type} required />; return <PublicShell back><main className="registration-layout"><div className="registration-copy"><span className="eyebrow"><span className="pulse-dot" /> {isCustomer ? 'CUSTOMER ACCOUNT' : 'TECHNICIAN ONBOARDING'}</span><h1>{isCustomer ? <>Make your home<br /><em>easier to manage.</em></> : <>Put your expertise<br /><em>to work.</em></>}</h1><p>{isCustomer ? 'Create your account in a few simple steps. Add devices after you are in.' : 'Build your professional profile for future service assignments.'}</p></div><section className="form-card"><div className="stepper">{steps.map((label, index) => <div className={index + 1 <= step ? 'step active' : 'step'} key={label}><span>{index + 1}</span><small>{label}</small></div>)}</div><p className="mobile-step">Step {step} of {steps.length}</p><h2>{steps[step - 1]}</h2><form className="auth-form" onSubmit={submit}>{step === 1 && <>{f('Full Name', 'name', 'Your full name')}{f('Email Address', 'email', 'you@example.com', 'email')}{f('Mobile Number', 'mobile', '+91 00000 00000', 'tel')}{f('Password', 'password', 'At least 8 characters', 'password')}{f('Confirm Password', 'confirm', 'Repeat your password', 'password')}</>}{isCustomer && step === 2 && <>{f('Address Line 1', 'address1', 'House number and street')}{f('Address Line 2', 'address2', 'Optional')}{f('City', 'city', 'Your city')}{f('State', 'state', 'Your state')}{f('Pincode', 'pincode', '6-digit pincode')}</>}{isCustomer && step === 3 && <fieldset className="choice-group"><legend>Preferred Language</legend>{[['en', 'English'], ['ta', 'Tamil'], ['te', 'Telugu']].map(([value, label]) => <label className="choice" key={value}><input type="radio" name="language" checked={data.language === value} onChange={() => update('language')(value)} />{label}</label>)}</fieldset>}{isCustomer && step === 4 && <Review label="Account" value={`${data.name} · ${data.email}`} />}{!isCustomer && step === 2 && <>{f('Years of Experience', 'experience', 'e.g. 8', 'number')}{f('Primary Specialization', 'specialization', 'Smart home systems')}<fieldset className="choice-group"><legend>Service Categories and Languages</legend>{['Smart Home Devices', 'Security Cameras', 'Smart Lighting', 'English', 'Tamil', 'Telugu'].map((label) => <label className="choice" key={label}><input type="checkbox" />{label}</label>)}</fieldset></>}{!isCustomer && step === 3 && <>{f('Service City', 'city', 'Your city')}{f('State', 'state', 'Your state')}{f('Service Pincodes', 'pincodes', 'e.g. 600001')}{f('Service Radius', 'radius', '25 km')}<div className="time-row">{f('Working Hours Start', 'start', '09:00 AM')}{f('Working Hours End', 'end', '06:00 PM')}</div></>}{!isCustomer && step === 4 && <><Review label="Personal" value={`${data.name} · ${data.email}`} /><Review label="Professional" value={`${data.experience || '-'} years · ${data.specialization || '-'}`} /><Review label="Service Area" value={`${data.city || '-'} · ${data.radius || '25 km'}`} /></>}{error && <p className="form-message" role="alert">{error}</p>}<button className="primary-button">{step === steps.length ? (isCustomer ? 'Create Account' : 'Submit Application') : 'Continue'} <ArrowRight size={17} /></button></form><p className="login-hint">Already have an account? <Link to="/login">Login</Link></p></section></main></PublicShell> }

function Review({ label, value }: { label: string; value: string }) { return <div className="review-item"><span>{label}</span><strong>{value || 'Not provided'}</strong></div> }

type AiHistoryStatus = 'resolved' | 'escalated'

type AiHistoryConversationEntry = { speaker: 'Customer' | 'AI Assistant'; text: string }

type AiHistorySession = {
  id: string
  device: string
  brand: string
  location: string
  problem: string
  date: string
  status: AiHistoryStatus
  conversation: AiHistoryConversationEntry[]
  troubleshootingPerformed: string[]
  result: string
  ticketId?: string
}

const aiTroubleshootingHistory: AiHistorySession[] = [
  {
    id: 'AI-HT-001',
    device: 'Smart Security Camera',
    brand: 'Xiaomi',
    location: 'Entrance',
    problem: 'Camera is not powering on',
    date: 'Aug 30, 2026',
    status: 'escalated',
    ticketId: activeTicket.id,
    conversation: [
      { speaker: 'Customer', text: 'My camera is not turning on.' },
      { speaker: 'AI Assistant', text: "Let's check a few things first. Please check whether the camera is receiving power." },
      { speaker: 'Customer', text: 'I checked the power connection.' },
      { speaker: 'AI Assistant', text: 'Please check whether the status LED is on.' },
      { speaker: 'Customer', text: 'There is no light.' },
      { speaker: 'AI Assistant', text: 'Please try restarting the device.' },
      { speaker: 'Customer', text: "I tried restarting it but it still doesn't work." },
      { speaker: 'AI Assistant', text: 'The issue may require professional assistance.' },
    ],
    troubleshootingPerformed: ['Power connection checked', 'Status LED checked', 'Device restarted'],
    result: 'Problem was not resolved.',
  },
  {
    id: 'AI-HT-002',
    device: 'Smart AC',
    brand: 'LG',
    location: 'Living Room',
    problem: 'AC is not cooling properly',
    date: 'Aug 25, 2026',
    status: 'resolved',
    conversation: [
      { speaker: 'Customer', text: 'The AC is not cooling the room properly.' },
      { speaker: 'AI Assistant', text: 'I can help with that. Please confirm the temperature setting and airflow.' },
      { speaker: 'Customer', text: 'The temperature is set to 20°C and the airflow is normal.' },
      { speaker: 'AI Assistant', text: 'Please clean the filter and check if the compressor is running.' },
      { speaker: 'Customer', text: 'The filter was cleaned and the compressor is working.' },
      { speaker: 'AI Assistant', text: 'That usually points to a low refrigerant level or airflow restriction. Please restart the unit and check again.' },
      { speaker: 'Customer', text: 'I restarted it and the cooling is back to normal.' },
      { speaker: 'AI Assistant', text: 'Great — the issue is resolved.' },
    ],
    troubleshootingPerformed: ['Temperature settings checked', 'Airflow checked', 'Filter cleaned', 'Restart performed'],
    result: 'Problem resolved by AI guidance.',
  },
]

const navItems = [{ path: '/customer/dashboard', label: 'Dashboard', icon: Home }, { path: '/customer/devices', label: 'My Devices', icon: Camera }, { path: '/customer/ai', label: 'AI Assistant', icon: Bot }, { path: '/customer/ai-troubleshooting-history', label: 'AI Troubleshooting History', icon: MessageCircle }, { path: '/customer/tickets', label: 'My Tickets', icon: Ticket }, { path: '/customer/notifications', label: 'Notifications', icon: Bell }]
function CustomerPortal() { return <CustomerShell><Routes><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<Dashboard />} /><Route path="devices" element={<Devices />} /><Route path="devices/:id" element={<DeviceDetails />} /><Route path="add-device" element={<AddDevice />} /><Route path="ai" element={<AiAssistant />} /><Route path="ai-troubleshooting-history" element={<AiTroubleshootingHistoryPage />} /><Route path="tickets" element={<Tickets />} /><Route path="tickets/:id" element={<TicketDetails />} /><Route path="notifications" element={<Notifications />} /><Route path="profile" element={<Profile />} /><Route path="settings" element={<SettingsPage />} /></Routes></CustomerShell> }
function CustomerShell({ children }: { children: ReactNode }) { const location = useLocation(); const [open, setOpen] = useState(false); return <div className="customer-app"><aside className={open ? 'customer-sidebar open' : 'customer-sidebar'}><div className="customer-brand"><span className="brand-mark"><Sparkles size={17} /></span><span><strong>SmartAssist</strong><small>Smart Home Support</small></span></div><nav aria-label="Main navigation">{navItems.map(({ path, label, icon: Icon }) => <Link className={location.pathname.startsWith(path) ? 'customer-nav active' : 'customer-nav'} to={path} key={path} onClick={() => setOpen(false)}><Icon size={18} />{label}</Link>)}</nav><div className="sidebar-divider" /><Link className="customer-nav" to="/customer/profile"><UserRound size={18} />Profile</Link><Link className="customer-nav" to="/customer/settings"><Settings size={18} />Settings</Link><div className="sidebar-user"><span className="avatar">RX</span><span><strong>{customer.name}</strong><small>{customer.email}</small></span></div><Link className="logout-link" to="/login"><LogOut size={16} />Log out</Link></aside><div className="customer-main"><header className="customer-header"><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Open navigation">{open ? <X size={20} /> : <Menu size={20} />}</button><div><span className="header-kicker">CUSTOMER PORTAL</span><h1>{navItems.find((item) => location.pathname.startsWith(item.path))?.label || 'Account'}</h1></div><div className="header-actions"><Link className="header-icon" to="/customer/notifications"><Bell size={19} /><span>2</span></Link><Link className="header-avatar" to="/customer/profile">RX</Link></div></header><div className="customer-content">{children}</div></div><nav className="mobile-nav">{navItems.map(({ path, label, icon: Icon }) => <Link className={location.pathname.startsWith(path) ? 'active' : ''} to={path} key={path}><Icon size={18} /><small>{label === 'My Devices' ? 'Devices' : label === 'AI Assistant' ? 'AI' : label.replace('My ', '')}</small></Link>)}</nav></div> }

function PageIntro({ kicker, title, description, action, children }: { kicker: string; title: string; description: string; action?: ReactNode; children: ReactNode }) { const aiPage = window.location.pathname === '/customer/ai'; return <div className="page-intro"><div className="page-title"><div><span className="section-kicker">{kicker}</span><h2>{title}</h2><p>{description}</p></div>{action}</div>{children}{aiPage && <AiTicketLauncher />}</div> }

function AiTicketLauncher() { const deviceId = new URLSearchParams(window.location.search).get('device'); const device = devices.find((item) => item.id === deviceId) || devices[0]; const [open, setOpen] = useState(false); const [created, setCreated] = useState<string | null>(null); const [busy, setBusy] = useState(false); const createTicket = async () => { setBusy(true); const result = await createServiceTicket({ deviceName: device.name, brand: device.brand, location: device.location, issue: 'Device is powered on but video is not visible.', language: 'English', conversation: ['Device identified', 'Problem understood', 'Basic checks'] }); setCreated(result.id); setBusy(false); setOpen(false) }; return <>{!created && <button className="raise-ticket-button" type="button" onClick={() => setOpen(true)}><Ticket size={16} /> Raise a Ticket</button>}{created && <div className="ticket-created-banner" role="status"><Check size={16} /> Ticket {created} created successfully.</div>}{open && <div className="ticket-modal-backdrop"><section className="ticket-modal" role="dialog" aria-modal="true" aria-labelledby="raise-ticket-title"><button className="modal-close" type="button" aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></button><span className="ai-entry-icon"><Ticket size={22} /></span><h2 id="raise-ticket-title">Review service request</h2><p>We will share your troubleshooting context with a suitable technician.</p><div className="ticket-review"><Review label="Device" value={device.name} /><Review label="Brand" value={device.brand} /><Review label="Location" value={device.location} /><Review label="Problem" value="Device is powered on but video is not visible." /><Review label="AI context" value="Basic checks completed" /></div><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setOpen(false)}>Continue Chat</button><button className="primary-button" type="button" disabled={busy} onClick={createTicket}>{busy ? 'Creating Ticket...' : 'Create Ticket'}</button></div></section></div>}</> }
function Dashboard() { const navigate = useNavigate(); const stats = [{ label: 'Registered Devices', value: '3', icon: Camera, path: '/customer/devices' }, { label: 'Active Tickets', value: '1', icon: Ticket, path: '/customer/tickets' }, { label: 'Completed Services', value: '5', icon: Check, path: '/customer/tickets' }, { label: 'AI Sessions', value: '8', icon: Bot, path: '/customer/ai' }, { label: 'Notifications', value: '2', icon: Bell, path: '/customer/notifications' }]; return <div className="dashboard-page"><section className="welcome-hero"><div><span className="eyebrow light">SMARTASSIST AI</span><h2>Welcome back, {customer.name}</h2><p>Your smart-home support hub. Troubleshoot devices with AI, track service requests, and manage your home in one place.</p><button className="ai-button" onClick={() => navigate('/customer/ai')}><Bot size={18} /> Start AI Troubleshooting <ArrowRight size={16} /></button></div><div className="hero-orbit"><Zap size={34} /></div></section><div className="stat-grid">{stats.map(({ label, value, icon: Icon, path }) => <button className="customer-stat" key={label} onClick={() => navigate(path)}><span className="stat-icon"><Icon size={18} /></span><strong>{value}</strong><span>{label}</span><ArrowRight size={15} /></button>)}</div><section className="section-block"><div className="section-heading"><div><span className="section-kicker">ACTIVE SERVICE</span><h2>Something needs attention</h2></div><Link to={`/customer/tickets/${activeTicket.id}`}>View service <ArrowRight size={14} /></Link></div><article className="active-service"><span className="device-badge camera"><Camera size={23} /></span><div className="service-info"><span className="status-badge warning">On the Way</span><h3>{activeTicket.device}</h3><p>{activeTicket.issue}</p><div className="technician-line"><span className="avatar small">MK</span><span><strong>{activeTicket.technician}</strong><small><ShieldCheck size={12} /> Verified · {activeTicket.rating} rating</small></span></div></div><div className="eta"><small>ETA</small><strong>{activeTicket.eta}</strong></div></article></section><div className="dashboard-columns"><section className="section-block"><div className="section-heading"><div><span className="section-kicker">MY DEVICES</span><h2>Connected at home</h2></div><Link to="/customer/devices">View all <ArrowRight size={14} /></Link></div><div className="device-preview">{devices.map((device) => <DeviceCard device={device} compact key={device.id} />)}</div></section><section className="section-block activity-block"><div className="section-heading"><div><span className="section-kicker">RECENT ACTIVITY</span><h2>Latest updates</h2></div></div>{recentActivity.map((item) => <div className="activity-item" key={item.title}><span className="activity-icon"><Check size={14} /></span><span><strong>{item.title}</strong><small>{item.date}</small></span></div>)}</section></div></div> }
function DeviceCard({ device, compact = false }: { device: typeof devices[number]; compact?: boolean }) { const navigate = useNavigate(); const Icon = device.icon === 'light' ? Lightbulb : Camera; return <article className={compact ? 'device-card compact' : 'device-card'}><div className="device-card-top"><span className={`device-badge ${device.icon}`}><Icon size={compact ? 21 : 28} /></span><button className="more-button" aria-label="More options"><MoreHorizontal size={18} /></button></div><h3>{device.name}</h3><p>{device.brand} · {device.model}</p><span className="device-location">Location: {device.location}</span>{compact ? <button className="text-button" onClick={() => navigate(`/customer/devices/${device.id}`)}>View device <ArrowRight size={14} /></button> : <><div className="device-meta"><span className="status-badge success">Registered</span><small>Warranty: {device.warranty}</small></div><button className="outline-button" onClick={() => navigate(`/customer/ai?device=${device.id}`)}><Bot size={15} /> Troubleshoot</button></>}</article> }
function Devices() { const navigate = useNavigate(); return <PageIntro kicker="YOUR HOME" title="My Devices" description="Manage your registered smart-home devices." action={<button className="primary-button compact-button" onClick={() => navigate('/customer/add-device')}><Plus size={16} /> Add Device</button>}><div className="device-grid">{devices.map((device) => <DeviceCard device={device} key={device.id} />)}<button className="add-device-tile" onClick={() => navigate('/customer/add-device')}><Plus size={24} /><strong>Add another device</strong><span>Keep support context up to date.</span></button></div></PageIntro> }
function DeviceDetails() { const { id } = useParams(); const device = devices.find((item) => item.id === id) || devices[0]; const navigate = useNavigate(); return <PageIntro kicker="MY DEVICES" title={device.name} description={`${device.brand} · ${device.model} · ${device.location}`}><div className="detail-hero"><span className={`device-badge ${device.icon}`}><Camera size={42} /></span><div><span className="status-badge success">Registered</span><h2>{device.brand} {device.model}</h2><p>Warranty: {device.warranty}</p></div><button className="primary-button" onClick={() => navigate(`/customer/ai?device=${device.id}`)}><Bot size={17} /> Troubleshoot This Device</button></div><div className="detail-grid"><section className="content-panel"><h3>Device information</h3><div className="info-grid"><Review label="Category" value="Smart home device" /><Review label="Brand" value={device.brand} /><Review label="Model" value={device.model} /><Review label="Location" value={device.location} /></div></section><section className="content-panel"><h3>Previous troubleshooting</h3><p className="empty-copy">No previous sessions for this device.</p><button className="text-button" onClick={() => navigate(`/customer/ai?device=${device.id}`)}>Start a session <ArrowRight size={14} /></button></section></div></PageIntro> }
function CatalogIcon({ type }: { type: CatalogDevice['icon'] }) { const icons = { lock: LockKeyhole, camera: Camera, doorbell: Bell, sensor: Zap, bulb: Lightbulb, strip: Zap, switch: Settings, ac: Activity, thermostat: Activity, purifier: Activity, tv: Home, speaker: MessageCircle, soundbar: MessageCircle, router: Activity, extender: Activity, mesh: Activity, fridge: Home, microwave: Activity, dishwasher: Activity, vacuum: Activity, washer: Activity, dryer: Activity, plug: Zap, smoke: ShieldCheck, leak: Activity, curtain: Home, garage: Home }; const Icon = icons[type]; return <Icon size={24} strokeWidth={1.7} /> }

function AddDevice() {
  const navigate = useNavigate(); const [category, setCategory] = useState<DeviceCategory>('Security'); const [query, setQuery] = useState(''); const [selected, setSelected] = useState<CatalogDevice | null>(null); const [name, setName] = useState(''); const [brand, setBrand] = useState(''); const [location, setLocation] = useState(''); const [model, setModel] = useState(''); const [saved, setSaved] = useState(false)
  const visibleDevices = deviceCatalog.filter((device) => device.category === category && device.name.toLowerCase().includes(query.toLowerCase()))
  const selectDevice = (device: CatalogDevice) => { setSelected(device); setName(device.name) }
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!selected || !name || !brand || !location) return; await addCustomerDevice({ name, brand, location }); setSaved(true) }
  if (saved) return <PageIntro kicker="MY DEVICES" title="Device added" description="Your new device is ready for personalized support."><section className="content-panel narrow-panel success-state"><Check size={28} /><h3>{name} added successfully</h3><p>{brand} · {location}</p><button className="primary-button" onClick={() => navigate('/customer/devices')}>View My Devices <ArrowRight size={16} /></button></section></PageIntro>
  if (selected) return <PageIntro kicker="ADD DEVICE" title={selected.name} description="Add a few details so SmartAssist can recognize your device."><section className="content-panel narrow-panel"><button className="back-inline" type="button" onClick={() => setSelected(null)}><ChevronLeft size={15} /> Choose a different device</button><div className="selected-device"><span className="catalog-icon"><CatalogIcon type={selected.icon} /></span><span><strong>{selected.name}</strong><small>{selected.category}</small></span></div><form className="portal-form" onSubmit={submit}>{fieldFor('Device Name', name, setName, selected.name)}{fieldFor('Brand', brand, setBrand, 'e.g. Xiaomi')}{fieldFor('Location', location, setLocation, 'e.g. Living Room')}{fieldFor('Model (optional)', model, setModel, 'Model name')}<button className="primary-button" type="submit"><Plus size={16} /> Add Device</button></form></section></PageIntro>
  return <PageIntro kicker="MY DEVICES" title="Choose a device" description="Select the smart-home device you want to add. You can search or browse by category."><div className="catalog-toolbar"><div className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search devices" aria-label="Search devices" /></div></div><div className="catalog-layout"><aside className="catalog-categories" aria-label="Device categories">{deviceCategories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}<span>{deviceCatalog.filter((device) => device.category === item).length}</span></button>)}</aside><div className="catalog-grid">{visibleDevices.map((device) => <button className="catalog-card" key={device.id} onClick={() => selectDevice(device)}><span className="catalog-icon"><CatalogIcon type={device.icon} /></span><span><strong>{device.name}</strong><small>{device.category}</small></span><ArrowRight size={15} /></button>)}{visibleDevices.length === 0 && <div className="empty-copy">No devices match your search.</div>}</div></div></PageIntro>
}

function fieldFor(label: string, value: string, onChange: (value: string) => void, placeholder: string) { return <Field label={label} value={value} onChange={onChange} placeholder={placeholder} required={label !== 'Model (optional)'} /> }

function AiAssistant() { const selectedId = new URLSearchParams(window.location.search).get('device'); const selected = devices.find((item) => item.id === selectedId); const [device, setDevice] = useState(selected); const [language, setLanguage] = useState('English'); const [chat, setChat] = useState(false); const [message, setMessage] = useState(''); const send = () => { if (message.trim()) { setChat(true); setMessage('') } }; if (!chat) return <PageIntro kicker="AI ASSISTANT" title="Troubleshoot with SmartAssist" description="Start with a device. Your conversation stays with the support request if you need professional help."><section className="ai-entry"><div className="ai-entry-icon"><Bot size={28} /></div><h3>{device ? `${device.name} selected` : 'Which device needs help?'}</h3><p>{device ? `${device.brand} · ${device.location}` : 'Choose from your registered devices.'}</p>{!device && <div className="device-select-grid">{devices.map((item) => <button key={item.id} onClick={() => setDevice(item)}><Camera size={20} /><span><strong>{item.name}</strong><small>{item.brand} · {item.location}</small></span><ArrowRight size={15} /></button>)}</div>}{device && <><div className="language-options"><span>Choose a support language</span>{['English', 'Tamil', 'Telugu'].map((item) => <button className={language === item ? 'active' : ''} key={item} onClick={() => setLanguage(item)}>{item}</button>)}</div><button className="primary-button start-ai" onClick={() => setChat(true)}><Bot size={17} /> Start Troubleshooting</button></>}</section></PageIntro>; return <PageIntro kicker="AI ASSISTANT" title="SmartAssist AI" description={`${device?.name || 'Device'} · ${device?.brand || ''}`}><section className="chat-panel"><div className="diagnosis-progress"><span className="done">Device identified</span><span className="done">Problem understood</span><span className="current">Basic checks</span><span>Finding cause</span></div><div className="chat-messages"><div className="ai-message"><Bot size={16} /><p>I can help with your {device?.name.toLowerCase()}. What is happening?</p></div><div className="user-message"><p>It is powered on, but I cannot see the video.</p></div><div className="ai-message"><Bot size={16} /><p>Is the device connected to your Wi-Fi right now?</p></div></div><div className="chat-input"><button type="button" aria-label="Add image"><ImagePlus size={19} /></button><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} placeholder="Describe what you are seeing..." /><button type="button" aria-label="Record voice"><Mic size={19} /></button><button className="send-button" type="button" aria-label="Send message" onClick={send}><ArrowRight size={18} /></button></div><p className="chat-note"><Sparkles size={13} /> Clear, actionable guidance. Professional help is available when physical inspection is needed.</p></section></PageIntro> }
function AiTroubleshootingHistoryPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'resolved' | 'escalated'>('all')
  const [selectedSession, setSelectedSession] = useState<AiHistorySession | null>(null)

  const visibleSessions = aiTroubleshootingHistory.filter((session) => filter === 'all' || session.status === filter)

  return (
    <PageIntro kicker="AI SUPPORT" title="AI Troubleshooting History" description="View your previous AI troubleshooting conversations and support history.">
      <div className="ai-history-filters" role="tablist" aria-label="AI troubleshooting history filters">
        {(['all', 'resolved', 'escalated'] as const).map((option) => (
          <button
            key={option}
            type="button"
            className={filter === option ? 'secondary-button ai-history-filter active' : 'secondary-button ai-history-filter'}
            onClick={() => setFilter(option)}
          >
            {option === 'all' ? 'All' : option === 'resolved' ? 'Resolved' : 'Escalated'}
          </button>
        ))}
      </div>

      {visibleSessions.length === 0 ? (
        <section className="content-panel empty-state-panel">
          <h3>No troubleshooting sessions yet.</h3>
          <p>Start a conversation with SmartAssist to troubleshoot your smart-home devices.</p>
          <button type="button" className="primary-button" onClick={() => navigate('/customer/ai')}>
            <Bot size={16} /> Start AI Troubleshooting
          </button>
        </section>
      ) : (
        <div className="ai-history-list">
          {visibleSessions.map((session) => (
            <article className="content-panel ai-history-card" key={session.id}>
              <div className="ai-history-header">
                <div className="ai-history-device">
                  <span className="device-badge camera"><Camera size={22} /></span>
                  <div>
                    <h3>{session.device}</h3>
                    <p>{session.brand} · {session.location}</p>
                  </div>
                </div>
              </div>

              <div className="ai-history-body">
                <span className="history-label">Problem</span>
                <p>{session.problem}</p>

                <div className="ai-history-meta-row">
                  <span>{session.date}</span>
                  <span className={session.status === 'resolved' ? 'status-badge success' : 'status-badge warning'}>
                    {session.status === 'resolved' ? 'Resolved by AI' : 'Escalated to Service Ticket'}
                  </span>
                </div>

                <button type="button" className="text-button" onClick={() => setSelectedSession(session)}>
                  View Conversation <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedSession && (
        <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="history-session-title">
          <div className="ticket-modal review-application-modal">
            <button type="button" className="modal-close" aria-label="Close" onClick={() => setSelectedSession(null)}>
              <X size={18} />
            </button>

            <div className="review-modal-header">
              <span className="ai-entry-icon"><Bot size={24} /></span>
              <div>
                <h2 id="history-session-title">{selectedSession.device}</h2>
                <p>{selectedSession.brand} · {selectedSession.location}</p>
              </div>
            </div>

            <div className="review-modal-content">
              <section className="review-section">
                <h3>Problem</h3>
                <div className="review-grid">
                  <div className="review-item full-width">
                    <span>Issue</span>
                    <strong>{selectedSession.problem}</strong>
                  </div>
                </div>
              </section>

              <section className="review-section">
                <h3>Conversation</h3>
                <div className="ai-history-conversation">
                  {selectedSession.conversation.map((entry, index) => (
                    <div key={`${selectedSession.id}-${entry.speaker}-${index}`} className={entry.speaker === 'Customer' ? 'ai-history-message customer' : 'ai-history-message ai'}>
                      <span>{entry.speaker}</span>
                      <p>{entry.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="review-section">
                <h3>Troubleshooting Summary</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span>Problem</span>
                    <strong>{selectedSession.problem}</strong>
                  </div>
                  <div className="review-item">
                    <span>Status</span>
                    <strong>{selectedSession.status === 'resolved' ? 'Resolved by AI' : 'Escalated to Service Ticket'}</strong>
                  </div>
                  <div className="review-item full-width">
                    <span>Troubleshooting performed</span>
                    <strong>{selectedSession.troubleshootingPerformed.join(' · ')}</strong>
                  </div>
                  <div className="review-item full-width">
                    <span>Result</span>
                    <strong>{selectedSession.result}</strong>
                  </div>
                  {selectedSession.ticketId && (
                    <div className="review-item full-width">
                      <span>Ticket ID</span>
                      <strong>{selectedSession.ticketId}</strong>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {selectedSession.ticketId && (
              <div className="modal-actions">
                <button type="button" className="primary-button" onClick={() => navigate(`/customer/tickets/${selectedSession.ticketId}`)}>
                  View Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageIntro>
  )
}

function Tickets() { const navigate = useNavigate(); return <PageIntro kicker="SERVICE HISTORY" title="My Tickets" description="Follow each request from diagnosis to completed repair."><div className="ticket-tabs"><button className="active">Active (1)</button><button>Completed ({completedTickets.length})</button></div><article className="ticket-card active-ticket" onClick={() => navigate(`/customer/tickets/${activeTicket.id}`)}><div className="ticket-card-top"><span>{activeTicket.id}</span><span className="status-badge warning">On the Way</span></div><h3>{activeTicket.device}</h3><p>{activeTicket.issue}</p><div className="ticket-details"><span>Technician: <strong>{activeTicket.technician}</strong></span><span>ETA: <strong>{activeTicket.eta}</strong></span></div><button className="text-button">View Ticket <ArrowRight size={14} /></button></article><h3 className="subsection-title">Completed</h3>{completedTickets.map((ticket) => <article className="ticket-card" key={ticket.id}><div className="ticket-card-top"><span>{ticket.id}</span><span className="status-badge success">Completed</span></div><h3>{ticket.device}</h3><p>{ticket.issue}</p><div className="ticket-details"><span>Technician: <strong>{ticket.technician}</strong></span><span>{ticket.date}</span></div></article>)}</PageIntro> }
function TicketDetails() { return <PageIntro kicker="MY TICKETS" title={activeTicket.id} description={`${activeTicket.device} · ${activeTicket.issue}`}><div className="ticket-status-head"><span className="status-badge warning">Technician On the Way</span><span>Priority: Medium</span><span>Created: Aug 28, 2026</span></div><section className="content-panel"><h3>Service timeline</h3><div className="service-timeline">{['Ticket Created', 'AI Diagnosis Completed', 'Technician Assigned', 'Technician Accepted', 'On the Way', 'Arrived', 'Repair Started', 'Completed'].map((item, index) => <div className={index < 4 ? 'timeline-row complete' : index === 4 ? 'timeline-row current' : 'timeline-row'} key={item}><span>{index < 4 ? <Check size={13} /> : index === 4 ? '●' : '○'}</span>{item}</div>)}</div></section><section className="technician-card"><span className="avatar large">MK</span><div><span className="status-badge success">Verified Technician</span><h3>{activeTicket.technician}</h3><p>Smart Home Specialist · {activeTicket.rating} rating</p></div><div className="eta"><small>ETA</small><strong>{activeTicket.eta}</strong></div></section></PageIntro> }
function Notifications() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | NotificationType>('all')
  const filters: { value: 'all' | NotificationType; label: string }[] = [{ value: 'all', label: 'All' }, { value: 'service', label: 'Service' }, { value: 'ai', label: 'AI' }, { value: 'account', label: 'Account' }]
  const visibleNotifications = selectedFilter === 'all' ? customerNotifications : customerNotifications.filter((notification) => notification.type === selectedFilter)
  const countFor = (filter: 'all' | NotificationType) => filter === 'all' ? customerNotifications.length : customerNotifications.filter((notification) => notification.type === filter).length
  return <PageIntro kicker="UPDATES" title="Notifications" description="Service and account updates in one place."><div className="notification-tabs" role="tablist" aria-label="Notification category">{filters.map((filter) => <button key={filter.value} type="button" role="tab" aria-selected={selectedFilter === filter.value} className={selectedFilter === filter.value ? 'active' : ''} onClick={() => setSelectedFilter(filter.value)}>{filter.label} ({countFor(filter.value)})</button>)}</div>{visibleNotifications.length > 0 ? visibleNotifications.map((notification) => <article className="notification-item" key={notification.id}><span className="notification-icon"><Bell size={16} /></span><span><strong>{notification.title}</strong><p>{notification.description}</p><small>{notification.timestamp}</small></span>{!notification.read && <span className="unread" aria-label="Unread notification" />}</article>) : <div className="empty-copy notification-empty">No notifications yet</div>}</PageIntro>
}
function Profile() {
  const [editing, setEditing] = useState(false); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [errors, setErrors] = useState<Record<string, string>>({}); const [draft, setDraft] = useState<CustomerProfile>(customer)
  const update = (key: keyof CustomerProfile) => (value: string) => setDraft((current) => ({ ...current, [key]: value }))
  const beginEdit = () => { setDraft({ ...customer }); setErrors({}); setSaved(false); setEditing(true) }
  const cancel = () => { setDraft({ ...customer }); setErrors({}); setEditing(false) }
  const validate = () => { const next: Record<string, string> = {}; if (!draft.name.trim() || !/^[A-Za-zÀ-ÿ]+(?:[ '-][A-Za-zÀ-ÿ]+)+$/.test(draft.name.trim())) next.name = 'Enter your full name.'; if (!/^\S+@\S+\.\S+$/.test(draft.email)) next.email = 'Enter a valid email address.'; if (!/^\+?[0-9\s-]{10,15}$/.test(draft.mobile)) next.mobile = 'Enter a valid mobile number.'; if (!/^\d{6}$/.test(draft.pincode)) next.pincode = 'Enter a valid 6-digit Indian pincode.'; setErrors(next); return Object.keys(next).length === 0 }
  const save = async (event: FormEvent) => { event.preventDefault(); setSaved(false); if (!navigator.onLine) return setErrors({ offline: "You're offline. Reconnect to save your changes." }); if (!validate()) return; setSaving(true); await updateCustomerProfile(draft); setSaving(false); setEditing(false); setSaved(true) }
  const displayLanguage = draft.language === 'ta' ? 'Tamil' : draft.language === 'te' ? 'Telugu' : 'English'
  return <PageIntro kicker="ACCOUNT" title="Profile" description="Your contact and service location details."><section className="content-panel profile-panel profile-editor">{saved && <p className="profile-success" role="status">Profile updated successfully.</p>}{editing ? <form className="portal-form" onSubmit={save}><ProfileField label="Full Name" value={draft.name} onChange={update('name')} error={errors.name} required /><ProfileField label="Email Address" value={draft.email} onChange={update('email')} error={errors.email} type="email" required />{draft.email !== customer.email && <p className="field-help">Changing your email may require account re-verification.</p>}<ProfileField label="Mobile Number" value={draft.mobile} onChange={update('mobile')} error={errors.mobile} type="tel" required /><ProfileField label="Address Line 1" value={draft.address1} onChange={update('address1')} required /><ProfileField label="Address Line 2" value={draft.address2 ?? ''} onChange={update('address2')} /><div className="form-row"><ProfileField label="City" value={draft.city} onChange={update('city')} required /><ProfileField label="State" value={draft.state} onChange={update('state')} required /></div><ProfileField label="Pincode" value={draft.pincode} onChange={update('pincode')} error={errors.pincode} inputMode="numeric" required /><ProfileField label="Landmark" value={draft.landmark} onChange={update('landmark')} /><div className="field"><label htmlFor="profile-language">Preferred Language</label><select id="profile-language" value={draft.language} onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value as CustomerProfile['language'] }))}><option value="en">English</option><option value="ta">Tamil</option><option value="te">Telugu</option></select></div>{errors.offline && <p className="form-message" role="alert">{errors.offline}</p>}<div className="profile-actions"><button className="secondary-button" type="button" onClick={cancel}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></div></form> : <><span className="avatar profile-avatar">RX</span><h3>{customer.name}</h3><p>{customer.email}</p><div className="info-grid"><Review label="Mobile" value={customer.mobile} /><Review label="Address" value={`${customer.address1}${customer.address2 ? `, ${customer.address2}` : ''}`} /><Review label="Location" value={`${customer.city}, ${customer.state} ${customer.pincode}`} /><Review label="Language" value={displayLanguage} /></div><button className="secondary-button" onClick={beginEdit}>Edit Profile</button></>}</section></PageIntro>
}

function ProfileField({ label, value, onChange, error, type = 'text', required = false, inputMode }: { label: string; value: string; onChange: (value: string) => void; error?: string; type?: string; required?: boolean; inputMode?: 'numeric' }) { const id = `profile-${label.toLowerCase().replaceAll(' ', '-')}`; return <div className="field"><label htmlFor={id}>{label}{required ? ' *' : ''}</label><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} inputMode={inputMode} />{error && <small className="field-error" id={`${id}-error`}>{error}</small>}</div> }
function SettingsPage() {
  const navigate = useNavigate(); const [language, setLanguage] = useState('English'); const [appearance, setAppearance] = useState('System'); const [toggles, setToggles] = useState({ service: true, ai: true, account: true, email: true, push: true });
  const toggle = (key: keyof typeof toggles) => setToggles((current) => ({ ...current, [key]: !current[key] }));
  const groups = [
    { title: 'Account & Profile', items: <><SettingsRow label="Account Information" detail={`${customer.name} · ${customer.email}`} onClick={() => navigate('/customer/profile')} /><SettingsRow label="Edit Profile" onClick={() => navigate('/customer/profile')} /></> },
    { title: 'Notifications', items: <><ToggleRow label="Service Updates" checked={toggles.service} onChange={() => toggle('service')} /><ToggleRow label="AI Updates" checked={toggles.ai} onChange={() => toggle('ai')} /><ToggleRow label="Account & Security Alerts" checked={toggles.account} onChange={() => toggle('account')} /><ToggleRow label="Email Notifications" checked={toggles.email} onChange={() => toggle('email')} /><ToggleRow label="Push Notifications" checked={toggles.push} onChange={() => toggle('push')} /></> },
    { title: 'Language & Preferences', items: <><SelectRow label="App Language" value={language} options={['English', 'Tamil', 'Telugu']} onChange={setLanguage} /><SelectRow label="Appearance" value={appearance} options={['Light', 'Dark', 'System']} onChange={setAppearance} /></> },
    { title: 'Security', items: <><SettingsRow label="Change Password" onClick={() => navigate('/reset-password')} /><SettingsRow label="Active Sessions" onClick={() => undefined} /><SettingsRow label="Sign Out Other Devices" onClick={() => undefined} /><SettingsRow label="Two-Factor Authentication" onClick={() => undefined} /></> },
    { title: 'Privacy & Data', items: <><SettingsRow label="Privacy Policy" onClick={() => undefined} /><SettingsRow label="Terms of Service" onClick={() => undefined} /><SettingsRow label="Data Usage" onClick={() => undefined} /><SettingsRow label="Download My Data" onClick={() => undefined} /><SettingsRow label="Delete Account" danger onClick={() => undefined} /></> },
    { title: 'Service Preferences', items: <><SettingsRow label="Default Service Location" detail={customer.location} onClick={() => navigate('/customer/profile')} /><SettingsRow label="Preferred Service Time" detail="09:00 AM - 06:00 PM" onClick={() => undefined} /></> },
    { title: 'Help & Support', items: <><SettingsRow label="Help Center" onClick={() => undefined} /><SettingsRow label="FAQ" onClick={() => undefined} /><SettingsRow label="Contact Support" onClick={() => undefined} /><SettingsRow label="Report a Problem" onClick={() => undefined} /><SettingsRow label="Give Feedback" onClick={() => undefined} /></> },
    { title: 'About SmartAssist', items: <><SettingsRow label="Version" detail="1.0.0" /><SettingsRow label="Privacy Policy" onClick={() => undefined} /><SettingsRow label="Terms of Service" onClick={() => undefined} /></> },
  ];
  return <PageIntro kicker="ACCOUNT" title="Settings" description="Manage your account, preferences and security."><div className="settings-groups">{groups.map((group) => <section className="settings-group" key={group.title}><h3>{group.title}</h3><div className="settings-list">{group.items}</div></section>)}<Link className="logout-button" to="/login"><LogOut size={16} /> Log Out</Link></div></PageIntro>
}

function SettingsRow({ label, detail, onClick, danger = false }: { label: string; detail?: string; onClick?: () => void; danger?: boolean }) { const content = <><span><strong className={danger ? 'danger-text' : ''}>{label}</strong>{detail && <small>{detail}</small>}</span>{onClick && <ArrowRight size={16} />}</>; return onClick ? <button className="settings-row" type="button" onClick={onClick}>{content}</button> : <div className="settings-row static">{content}</div> }
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) { return <div className="settings-row"><span><strong>{label}</strong></span><button className={checked ? 'toggle on' : 'toggle'} type="button" role="switch" aria-checked={checked} aria-label={`${label} ${checked ? 'on' : 'off'}`} onClick={onChange}><span /></button></div> }
function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <div className="settings-row"><span><strong>{label}</strong></span><select value={value} aria-label={label} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></div> }
function StatusPage() { const technician = window.location.pathname.includes('technician'); return <PublicShell><main className="status-layout"><section className="status-card"><div className="success-mark"><Check size={28} /></div><span className="eyebrow">APPLICATION CREATED</span><h1>{technician ? 'Your technician application is created.' : 'Account created successfully.'}</h1><p>{technician ? 'Your profile is ready for the next project phase.' : 'Welcome to SmartAssist AI. Your account is ready.'}</p><Link className="primary-button" to={technician ? '/technician/dashboard' : '/customer/dashboard'}>{technician ? 'Go to Technician Dashboard' : 'Go to Customer Dashboard'} <ArrowRight size={17} /></Link></section></main></PublicShell> }
function UtilityPage({ reset = false }: { reset?: boolean }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'request' | 'otp' | 'reset' | 'success'>('request');
  const [generatedCode, setGeneratedCode] = useState('');
  const [accountEmail, setAccountEmail] = useState('');

  const beginReset = (event: FormEvent) => {
    event.preventDefault();
    const expected = identifier.trim();
    if (!expected) return setMessage('Enter your email or mobile number to continue.');

    const account = findCustomerAccount(expected);
    if (!account) return setMessage('No customer account matches this email or mobile number.');

    const code = generateResetCode();
    setGeneratedCode(code);
    setAccountEmail(account.email);
    setStatus('otp');
    setMessage(`A security code was generated for ${accountEmail || account.email}. Demo code: ${code}`);
  };

  const verifyCode = (event: FormEvent) => {
    event.preventDefault();
    if (!otp.trim()) return setMessage('Enter the 6-digit verification code.');
    if (otp.trim() !== generatedCode) return setMessage('The verification code is incorrect. Please try again.');
    setStatus('reset');
    setMessage('Verification successful. Choose a new password.');
  };

  const submitNewPassword = (event: FormEvent) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) return setMessage('Please enter both password fields.');
    if (newPassword.length < 8) return setMessage('Password must be at least 8 characters long.');
    if (newPassword !== confirmPassword) return setMessage('Passwords do not match.');

    if (!identifier.trim()) return setMessage('Your account identifier is missing.');

    const updated = updateCustomerPassword(identifier, newPassword);
    if (!updated) return setMessage('Unable to update the password for this account.');

    setStatus('success');
    setMessage('Your password has been updated successfully.');
    setTimeout(() => navigate('/login'), 1200);
  };

  const heading = reset || status === 'reset' ? 'Reset your password' : 'Forgot password?';
  const description = status === 'otp'
    ? 'Enter the 6-digit code to verify your account.'
    : status === 'reset'
      ? 'Choose a strong password for your account.'
      : reset
        ? 'Choose a new password for your account.'
        : "If an account exists, we'll send a reset code to your email or mobile.";

  return (
    <PublicShell back>
      <main className="status-layout">
        <section className="status-card">
          <div className="role-icon"><LockKeyhole size={21} /></div>
          <h1>{heading}</h1>
          <p>{description}</p>

          {status === 'request' && (
            <form className="auth-form" onSubmit={beginReset}>
              <Field
                label="Email or Mobile Number"
                value={identifier}
                onChange={setIdentifier}
                placeholder="you@example.com"
                required
              />
              <button className="primary-button" type="submit">
                Send Reset Code <ArrowRight size={17} />
              </button>
            </form>
          )}

          {status === 'otp' && (
            <form className="auth-form" onSubmit={verifyCode}>
              <Field
                label="Verification Code"
                value={otp}
                onChange={setOtp}
                placeholder="Enter 6-digit code"
                inputMode="numeric"
                required
              />
              <button className="primary-button" type="submit">
                Verify Code <ArrowRight size={17} />
              </button>
            </form>
          )}

          {status === 'reset' && (
            <form className="auth-form" onSubmit={submitNewPassword}>
              <Field
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 8 characters"
                type="password"
                required
              />
              <Field
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repeat your password"
                type="password"
                required
              />
              <button className="primary-button" type="submit">
                Reset Password <ArrowRight size={17} />
              </button>
            </form>
          )}

          {status === 'success' && (
            <div className="auth-form">
              <div className="success-mark" style={{ margin: '0 auto 1rem' }}>
                <Check size={28} />
              </div>
              <p className="form-message" role="status">{message}</p>
            </div>
          )}

          {message && status !== 'success' && (
            <p className="form-message" role="alert">{message}</p>
          )}

          <Link className="center-link" to="/login">Return to login</Link>
        </section>
      </main>
    </PublicShell>
  )
}

function TechnicianPortal() {
  return (
    <TechnicianShell>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TechnicianDashboard />} />
        <Route path="jobs" element={<TechnicianJobsList />} />
        <Route path="jobs/:id" element={<TechnicianJobDetails />} />
        <Route path="profile" element={<TechnicianProfilePage />} />
        <Route path="settings" element={<TechnicianSettingsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </TechnicianShell>
  )
}

function TechnicianShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const state = useMockStore()
  const profile = state.technicianProfile
  const pendingJobsCount = state.tickets.filter(
    (t) => t.assignedTechnicianId === 'TECH-MK-01' && t.status !== 'COMPLETED'
  ).length

  return (
    <div className="technician-app">
      <aside className="technician-sidebar">
        <div className="technician-brand">
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>
          <span>
            <strong>SmartHome</strong>
            <small>Technician Portal</small>
          </span>
        </div>
        <nav aria-label="Technician navigation">
          <Link
            className={location.pathname === '/technician/dashboard' ? 'technician-nav active' : 'technician-nav'}
            to="/technician/dashboard"
          >
            <Home size={18} />
            Dashboard
          </Link>
          <Link
            className={location.pathname.startsWith('/technician/jobs') ? 'technician-nav active' : 'technician-nav'}
            to="/technician/jobs"
          >
            <Ticket size={18} />
            All Jobs
            {pendingJobsCount > 0 && <span className="nav-count">{pendingJobsCount}</span>}
          </Link>
        </nav>
        <div className="sidebar-divider" />
        <Link
          className={location.pathname.startsWith('/technician/profile') ? 'technician-nav active' : 'technician-nav'}
          to="/technician/profile"
        >
          <UserRound size={18} />
          Profile
        </Link>
        <Link
          className={location.pathname.startsWith('/technician/settings') ? 'technician-nav active' : 'technician-nav'}
          to="/technician/settings"
        >
          <Settings size={18} />
          Settings
        </Link>
        <Link className="technician-logout" to="/login">
          <LogOut size={16} />
          Logout
        </Link>
      </aside>
      <main className="technician-main">
        <header className="technician-header">
          <span className="header-kicker">TECHNICIAN PORTAL</span>
          <div className="technician-header-user">
            <span className="avatar">MK</span>
            <span>
              <strong>{profile.name}</strong>
              <small>{profile.email}</small>
            </span>
          </div>
        </header>
        <div className="technician-content">{children}</div>
      </main>
    </div>
  )
}

function TechnicianProfilePage() {
  const navigate = useNavigate()
  const state = useMockStore()
  const initial = state.technicianProfile
  const [draft, setDraft] = useState<TechnicianProfile>({
    ...initial,
    specializations: [...initial.specializations],
    skills: [...initial.skills],
    languages: [...initial.languages],
    pincodes: [...initial.pincodes],
    workingDays: [...initial.workingDays],
    workingHours: initial.workingHours ? { ...initial.workingHours } : null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const update = <K extends keyof TechnicianProfile>(key: K, value: TechnicianProfile[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)
  const allSkills = [...new Set(draft.specializations.flatMap((item) => specializationSkills[item] || []))]
  const required = [
    Boolean(draft.name),
    Boolean(draft.email),
    Boolean(draft.mobile),
    Boolean(draft.experience),
    draft.specializations.length > 0,
    draft.languages.length > 0,
    Boolean(draft.city),
    Boolean(draft.state),
    draft.pincodes.length > 0,
    Boolean(draft.serviceRadiusKm),
    draft.workingDays.length > 0,
    Boolean(draft.workingHours?.start && draft.workingHours?.end),
  ]
  const completion = Math.round((required.filter(Boolean).length / required.length) * 100)

  const validate = () => {
    const next: Record<string, string> = {}
    if (!draft.name.trim()) next.name = 'Full name is required.'
    if (!draft.email.includes('@')) next.email = 'Enter a valid email address.'
    if (!draft.mobile.trim()) next.mobile = 'Mobile number is required.'
    if (!draft.experience) next.experience = 'Experience is required.'
    if (!draft.specializations.length) next.specializations = 'Please select at least one specialization.'
    if (!draft.languages.length) next.languages = 'Please select at least one language.'
    if (!draft.city.trim()) next.city = 'City is required.'
    if (!draft.state.trim()) next.state = 'State is required.'
    if (!draft.pincodes.length) next.pincodes = 'Please enter at least one service pincode.'
    if (!draft.serviceRadiusKm) next.serviceRadiusKm = 'Please select a service radius.'
    if (!draft.workingDays.length) next.workingDays = 'Please select at least one working day.'
    if (!draft.workingHours?.start || !draft.workingHours?.end) next.workingHours = 'Working hours are required.'
    else if (draft.workingHours.end <= draft.workingHours.start)
      next.workingHours = 'End time must be later than start time.'
    setErrors(next)
    return !Object.keys(next).length
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    setSaved(false)
    if (!validate()) return
    setSaving(true)
    const updated = {
      ...draft,
      specialization: draft.specializations[0] || null,
      serviceArea: draft.city && draft.state ? `${draft.city}, ${draft.state}` : null,
      availability: draft.workingHours ? `${draft.workingHours.start} - ${draft.workingHours.end}` : null,
    }
    await updateTechnicianProfile(updated)
    setSaving(false)
    setSaved(true)
    setErrors({})
  }

  const cancel = () => {
    if (dirty) setConfirmCancel(true)
    else navigate('/technician/dashboard')
  }
  const discard = () => {
    setConfirmCancel(false)
    navigate('/technician/dashboard')
  }
  const toggleList = (key: 'specializations' | 'skills' | 'languages' | 'workingDays', value: string) => {
    const current = draft[key] as string[]
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    if (key === 'specializations') {
      const validSkills = new Set(next.flatMap((item) => specializationSkills[item] || []))
      update(
        'skills',
        draft.skills.filter((item) => validSkills.has(item))
      )
    }
    update(key, next)
  }

  return (
    <div className="technician-profile-page">
      <section className="technician-profile-heading">
        <div>
          <span className="section-kicker">TECHNICIAN PROFILE</span>
          <h1>Professional Profile</h1>
          <p>Complete your professional information to become eligible for the SmartAssist technician verification process.</p>
        </div>
        <div className="completion-card">
          <span>Profile Completion</span>
          <strong>{completion}%</strong>
          <div className="completion-track">
            <span style={{ width: `${completion}%` }} />
          </div>
        </div>
      </section>
      {saved && (
        <div className="technician-success" role="status">
          <Check size={16} /> Profile saved successfully.
        </div>
      )}
      <form onSubmit={save}>
        <section className="technician-panel profile-form-panel">
          <ProfileSectionTitle title="Personal Information" />
          <div className="technician-form-grid three">
            {techField('Full Name', draft.name, (value) => update('name', value), errors.name)}
            {techField('Email Address', draft.email, (value) => update('email', value), errors.email, true)}
            {techField('Mobile Number', draft.mobile, (value) => update('mobile', value), errors.mobile, true)}
          </div>
          <ProfileSectionTitle title="Professional Information" />
          <div className="technician-form-grid">
            <div className="technician-field">
              <label htmlFor="experience">Years of Experience *</label>
              <select
                id="experience"
                value={draft.experience || ''}
                onChange={(event) => update('experience', event.target.value)}
              >
                <option value="">Select experience</option>
                {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'].map((value) => (
                  <option key={value} value={value}>
                    {value} years
                  </option>
                ))}
              </select>
              {errors.experience && <small className="tech-error">{errors.experience}</small>}
            </div>
          </div>
          <textarea
            className="experience-summary"
            value={draft.experienceSummary}
            onChange={(event) => update('experienceSummary', event.target.value)}
            placeholder="Describe your professional experience (optional)"
            aria-label="Professional Experience Summary"
          />
          <ProfileSectionTitle title="Specialization" />
          <div className="selection-grid">
            {technicianSpecializations.map((item) => (
              <button
                className={draft.specializations.includes(item) ? 'selection-card selected' : 'selection-card'}
                type="button"
                aria-pressed={draft.specializations.includes(item)}
                key={item}
                onClick={() => toggleList('specializations', item)}
              >
                <span>{draft.specializations.includes(item) ? <Check size={15} /> : <Wrench size={15} />}</span>
                {item}
              </button>
            ))}
          </div>
          {errors.specializations && <small className="tech-error">{errors.specializations}</small>}
          <ProfileSectionTitle title="Skills / Categories" />
          <p className="tech-helper">Select skills related to your chosen specialization.</p>
          <div className="selection-grid skills">
            {allSkills.length ? (
              allSkills.map((item) => (
                <button
                  className={draft.skills.includes(item) ? 'selection-card selected' : 'selection-card'}
                  type="button"
                  aria-pressed={draft.skills.includes(item)}
                  key={item}
                  onClick={() => toggleList('skills', item)}
                >
                  <span>{draft.skills.includes(item) ? <Check size={15} /> : <Zap size={15} />}</span>
                  {item}
                </button>
              ))
            ) : (
              <p className="empty-copy">Choose a specialization to see relevant skills.</p>
            )}
          </div>
          {errors.skills && <small className="tech-error">{errors.skills}</small>}
          <ProfileSectionTitle title="Languages You Can Support" />
          <div className="selection-grid compact">
            {technicianLanguages.map((item) => (
              <button
                className={draft.languages.includes(item) ? 'selection-card selected' : 'selection-card'}
                type="button"
                aria-pressed={draft.languages.includes(item)}
                key={item}
                onClick={() => toggleList('languages', item)}
              >
                <span>{draft.languages.includes(item) ? <Check size={15} /> : <MessageCircle size={15} />}</span>
                {item}
              </button>
            ))}
          </div>
          {errors.languages && <small className="tech-error">{errors.languages}</small>}
          <ProfileSectionTitle title="Service Area" />
          <div className="technician-form-grid two">
            {techField('City', draft.city, (value) => update('city', value), errors.city)}
            {techField('State', draft.state, (value) => update('state', value), errors.state)}
            {techField(
              'Pincodes',
              draft.pincodes.join(', '),
              (value) =>
                update(
                  'pincodes',
                  value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean)
                ),
              errors.pincodes,
              false,
              '600028, 600018, 600020'
            )}
            <div className="technician-field">
              <label htmlFor="radius">Service Radius *</label>
              <select
                id="radius"
                value={draft.serviceRadiusKm || ''}
                onChange={(event) =>
                  update('serviceRadiusKm', event.target.value ? Number(event.target.value) : null)
                }
              >
                <option value="">Select radius</option>
                {technicianRadiusOptions.map((value) => (
                  <option key={value} value={value}>
                    {value} km
                  </option>
                ))}
              </select>
              {errors.serviceRadiusKm && <small className="tech-error">{errors.serviceRadiusKm}</small>}
            </div>
          </div>
          <ProfileSectionTitle title="Availability" />
          <div className="technician-field">
            <label>Working Days *</label>
            <div className="day-grid">
              {technicianWorkingDays.map((item) => (
                <button
                  className={draft.workingDays.includes(item) ? 'day-button selected' : 'day-button'}
                  type="button"
                  aria-pressed={draft.workingDays.includes(item)}
                  key={item}
                  onClick={() => toggleList('workingDays', item)}
                >
                  {draft.workingDays.includes(item) && <Check size={13} />}
                  {item}
                </button>
              ))}
            </div>
            {errors.workingDays && <small className="tech-error">{errors.workingDays}</small>}
          </div>
          <div className="technician-form-grid two hours-grid">
            <div className="technician-field">
              <label htmlFor="start-time">Start Time *</label>
              <input
                id="start-time"
                type="time"
                value={draft.workingHours?.start || ''}
                onChange={(event) =>
                  update('workingHours', { start: event.target.value, end: draft.workingHours?.end || '' })
                }
              />
            </div>
            <div className="technician-field">
              <label htmlFor="end-time">End Time *</label>
              <input
                id="end-time"
                type="time"
                value={draft.workingHours?.end || ''}
                onChange={(event) =>
                  update('workingHours', { start: draft.workingHours?.start || '', end: event.target.value })
                }
              />
            </div>
          </div>
          {errors.workingHours && <small className="tech-error">{errors.workingHours}</small>}
          <div className="technician-form-actions">
            <button className="secondary-button" type="button" onClick={cancel}>
              Cancel
            </button>
            <button className="primary-button" disabled={saving}>
              {saving ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </section>
      </form>
      {confirmCancel && (
        <div className="ticket-modal-backdrop">
          <section className="ticket-modal cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-profile-title">
            <h2 id="cancel-profile-title">You have unsaved changes.</h2>
            <p>Discard your changes?</p>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setConfirmCancel(false)}>
                Continue Editing
              </button>
              <button className="primary-button" type="button" onClick={discard}>
                Discard
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function ProfileSectionTitle({ title }: { title: string }) { return <h2 className="profile-section-title">{title}</h2> }
function techField(label: string, value: string, onChange: (value: string) => void, error?: string, readOnly = false, placeholder = '') { const id = `tech-${label.toLowerCase().replaceAll(' ', '-')}`; return <div className="technician-field"><label htmlFor={id}>{label}{['Full Name', 'Email Address', 'Mobile Number', 'City', 'State', 'Pincodes'].includes(label) ? ' *' : ''}</label><input id={id} value={value} onChange={(event) => onChange(event.target.value)} readOnly={readOnly} placeholder={placeholder} />{error && <small className="tech-error">{error}</small>}</div> }

export default App
