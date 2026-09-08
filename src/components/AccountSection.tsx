import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  KeyRound,
  RefreshCw,
  Cloud,
  Database,
  ShieldCheck,
  Edit3,
  Sparkles,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Check,
  Sliders,
  Flame,
  Layers,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
  User,
} from '../lib/firebase';
import { UserProgress, UserPreferences } from '../types';

export const PRESET_AVATARS = [
  {
    id: 'scholar-1',
    name: 'Học giả Trẻ',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=eaeae6',
  },
  {
    id: 'scholar-2',
    name: 'Nữ Học giả',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sophia&backgroundColor=fbf2ee',
  },
  {
    id: 'scholar-3',
    name: 'Nhà Nghiên cứu',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=eaefe8',
  },
  {
    id: 'adventurer-1',
    name: 'Nhà Thám hiểm',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=f5f2ed',
  },
  {
    id: 'adventurer-2',
    name: 'Nữ Thám hiểm',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia&backgroundColor=eaeae6',
  },
  {
    id: 'lorelei-1',
    name: 'Trang nhã',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Zoe&backgroundColor=fbf2ee',
  },
  {
    id: 'bot-1',
    name: 'Trợ lý AI',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gemini&backgroundColor=eaefe8',
  },
  {
    id: 'bot-2',
    name: 'Robot Tri thức',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Linguist&backgroundColor=f5f2ed',
  },
];

interface AccountSectionProps {
  user: User | null;
  cardCount: number;
  deckCount: number;
  progress: UserProgress;
  preferences?: UserPreferences;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  onManualSync: () => Promise<void>;
  onSignOut?: () => Promise<void> | void;
  onOpenPreferences?: () => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  user,
  cardCount,
  deckCount,
  progress,
  preferences,
  isSyncing,
  lastSyncedAt,
  onManualSync,
  onSignOut,
  onOpenPreferences,
}) => {
  // Mobile / Environment Detection
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const isInAppBrowser = typeof navigator !== 'undefined' && /FBAN|FBAV|Instagram|Line|MicroMessenger|Zalo/i.test(navigator.userAgent);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Sync state
  const [syncLoading, setSyncLoading] = useState(false);

  const isAnonymous = !user || user.isAnonymous;
  const isGoogleProvider = user?.providerData.some((p) => p.providerId === 'google.com');

  // Format Firebase Auth Errors to Vietnamese
  const getFriendlyAuthError = (err: unknown): string => {
    if (!(err instanceof Error)) return 'Đã xảy ra lỗi không xác định.';
    const msg = err.message || '';
    if (msg.includes('auth/invalid-email')) return 'Định dạng email không hợp lệ.';
    if (msg.includes('auth/user-not-found')) return 'Không tìm thấy tài khoản với email này.';
    if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
      return 'Email hoặc mật khẩu không chính xác.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'Email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập.';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Mật khẩu quá ngắn. Vui lòng nhập từ 6 ký tự trở lên.';
    }
    if (msg.includes('auth/requires-recent-login')) {
      return 'Bảo mật: Bạn cần nhập mật khẩu hiện tại hoặc đăng nhập lại trước khi đổi mật khẩu.';
    }
    if (msg.includes('auth/popup-blocked')) {
      return 'Trình duyệt trên điện thoại đã chặn cửa sổ Popup. Bạn hãy nhấn nút "Đăng nhập Google (Chuyển hướng trang)" bên dưới để đăng nhập trực tiếp.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Cửa sổ đăng nhập Google đã bị đóng. Bạn hãy thử lại hoặc chọn nút "Chuyển hướng trang" bên dưới.';
    }
    if (msg.includes('auth/cancelled-popup-request')) {
      return 'Thao tác mở cửa sổ đã được làm mới. Vui lòng nhấn thử lại.';
    }
    if (msg.includes('auth/unauthorized-domain')) {
      return 'Tên miền web hiện tại chưa được cấp quyền trong Firebase Auth. Bạn có thể sử dụng Đăng ký / Đăng nhập bằng Email ngay bên dưới để học và lưu trữ dữ liệu bình thường.';
    }
    if (msg.includes('auth/network-request-failed')) {
      return 'Lỗi kết nối mạng: Vui lòng kiểm tra Wifi/4G trên điện thoại.';
    }
    if (msg.includes('auth/too-many-requests')) {
      return 'Quá nhiều lần thử thất bại. Vui lòng đợi trong giây lát.';
    }
    if (msg.includes('auth/operation-not-allowed')) {
      return 'Phương thức này chưa được kích hoạt. Vui lòng sử dụng Đăng nhập bằng Google.';
    }
    return msg;
  };

  // Google Sign In (Popup or Direct Redirect)
  const handleGoogleSignIn = async (useRedirect = false) => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    // If explicit redirect requested or required for mobile
    if (useRedirect) {
      try {
        await signInWithRedirect(auth, googleProvider);
        return;
      } catch (err) {
        setAuthError(getFriendlyAuthError(err));
        setAuthLoading(false);
        return;
      }
    }

    // Default: try popup
    try {
      await signInWithPopup(auth, googleProvider);
      await onManualSync();
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const errCode = errorObj?.code || '';
      const errMsg = errorObj?.message || '';

      if (
        errCode === 'auth/popup-blocked' ||
        errMsg.includes('popup-blocked') ||
        (isMobile && !isInIframe && (errCode === 'auth/popup-closed-by-user' || errMsg.includes('popup-closed-by-user')))
      ) {
        setAuthError('Cửa sổ đăng nhập Google bị trình duyệt điện thoại chặn. Vui lòng nhấn nút "Đăng nhập Google (Chuyển hướng trang)" ngay bên dưới.');
      } else {
        setAuthError(getFriendlyAuthError(err));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Email / Password Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email || !email.includes('@')) {
      setAuthError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (authMode === 'forgot') {
      setAuthLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setAuthSuccess('Đã gửi email khôi phục mật khẩu! Vui lòng kiểm tra hộp thư đến của bạn.');
      } catch (err) {
        setAuthError(getFriendlyAuthError(err));
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setAuthError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setAuthError('Mật khẩu xác nhận không khớp.');
        return;
      }

      setAuthLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          const defaultAvatar = PRESET_AVATARS[0].url;
          await updateProfile(userCredential.user, {
            displayName: displayName.trim(),
            photoURL: defaultAvatar,
          });
        }
        await onManualSync();
        setAuthSuccess('Tạo tài khoản thành công! Dữ liệu của bạn đã được đồng bộ.');
      } catch (err) {
        setAuthError(getFriendlyAuthError(err));
      } finally {
        setAuthLoading(false);
      }
    } else {
      // Sign In
      setAuthLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        await onManualSync();
      } catch (err) {
        setAuthError(getFriendlyAuthError(err));
      } finally {
        setAuthLoading(false);
      }
    }
  };

  // Sign out
  const handleSignOut = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      await signOut(auth);
      if (onSignOut) {
        await onSignOut();
      }
      setAuthSuccess('Đã đăng xuất tài khoản thành công!');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
    } catch (err) {
      console.error('Sign out error:', err);
      setAuthError('Không thể đăng xuất. Vui lòng thử lại.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Update Display Name
  const handleSaveName = async () => {
    if (!user || !editNameInput.trim()) return;
    setNameLoading(true);
    try {
      await updateProfile(user, { displayName: editNameInput.trim() });
      setIsEditingName(false);
      await onManualSync();
    } catch (err) {
      console.error('Update name error:', err);
    } finally {
      setNameLoading(false);
    }
  };

  // Avatar Upload / Selection
  const handleSelectPresetAvatar = (url: string) => {
    setSelectedAvatarUrl(url);
    setCustomAvatarUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Vui lòng chọn tệp hình ảnh.');
      return;
    }

    // Limit file size to ~1MB to avoid heavy Firestore/Profile payload
    if (file.size > 1024 * 1024) {
      setAvatarError('Kích thước ảnh không quá 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedAvatarUrl(result);
      setCustomAvatarUrl('');
      setAvatarError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    const targetUrl = customAvatarUrl.trim() || selectedAvatarUrl;
    if (!user || !targetUrl) {
      setAvatarError('Vui lòng chọn hoặc tải lên một hình đại diện.');
      return;
    }

    setAvatarLoading(true);
    setAvatarError(null);
    try {
      await updateProfile(user, { photoURL: targetUrl });
      setIsAvatarModalOpen(false);
      await onManualSync();
    } catch (err) {
      setAvatarError('Không thể cập nhật ảnh đại diện. Vui lòng thử lại.');
    } finally {
      setAvatarLoading(false);
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!user) return;
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setPasswordLoading(true);
    try {
      // If current password was supplied and user has email, reauthenticate first
      if (currentPassword && user.email) {
        try {
          const cred = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, cred);
        } catch (reAuthErr) {
          setPasswordError('Mật khẩu hiện tại không chính xác.');
          setPasswordLoading(false);
          return;
        }
      }

      await updatePassword(user, newPassword);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      setPasswordError(getFriendlyAuthError(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  // Trigger Manual Sync
  const handleTriggerSync = async () => {
    setSyncLoading(true);
    try {
      await onManualSync();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 space-y-4 animate-in fade-in duration-200">
      {/* If Not Signed In (Guest Mode) -> Show Auth Screen */}
      {isAnonymous ? (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="p-5 rounded-3xl bg-white border border-[#E0DBCF] shadow-xs text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EAEFE8] border border-[#D6E0D3] text-[#4E6746] flex items-center justify-center shadow-xs">
              <UserIcon className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-serif font-bold text-[#3D3934]">
              Quản lý Tài khoản & Đồng bộ
            </h2>
            <p className="text-xs text-[#8A8479] leading-relaxed max-w-xs mx-auto">
              Đăng nhập để lưu vĩnh viễn kho từ vựng, chuỗi ngày học streak và tiếp tục học trên mọi điện thoại hay máy tính.
            </p>
          </div>

          {/* Prominent Global Alert for Auth Status / Errors */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63] text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#EAEFE8] border border-[#D6E0D3] text-[#4E6746] text-xs flex items-center space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="leading-relaxed">{authSuccess}</span>
            </div>
          )}

          {/* Notice when opened inside in-app browser (Zalo/Facebook) */}
          {isInAppBrowser && (
            <div className="p-3 rounded-2xl bg-[#FFF8E7] border border-[#F0E2BA] text-[#7A5B10] text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B8871E]" />
              <div className="space-y-1">
                <p className="font-bold">Đang mở trong trình duyệt ứng dụng (Zalo/Facebook)</p>
                <p className="text-[11px] leading-relaxed">
                  Google thường hạn chế mở cửa sổ đăng nhập trong app. Bạn hãy nhấn vào nút <strong>⋮</strong> ở góc màn hình và chọn <strong>"Mở bằng trình duyệt"</strong> (Safari/Chrome), hoặc dùng hình thức Đăng nhập Email bên dưới.
                </p>
              </div>
            </div>
          )}

          {/* Notice when inside an iframe */}
          {isInIframe && (
            <div className="p-2.5 rounded-2xl bg-[#F5F2ED] border border-[#E0DBCF] text-[11px] text-[#5C574F] flex items-center justify-between">
              <span className="truncate mr-2">Khung xem trước ứng dụng</span>
              <button
                type="button"
                onClick={() => window.open(window.location.href, '_blank')}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#D0CABE] text-[#3D3934] font-semibold text-[11px] flex items-center space-x-1.5 shrink-0 hover:bg-[#FAF9F6] shadow-2xs"
              >
                <ExternalLink className="w-3 h-3 text-[#8FA189]" />
                <span>Mở tab mới trên điện thoại</span>
              </button>
            </div>
          )}

          {/* Google Sign-In Actions */}
          <div className="space-y-2">
            {/* Primary Google Quick Sign-In (Popup) */}
            <button
              onClick={() => handleGoogleSignIn(false)}
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white border border-[#E0DBCF] hover:border-[#8FA189] hover:bg-[#FAF9F6] text-[#3D3934] text-xs font-bold flex items-center justify-center space-x-2.5 shadow-xs transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {authLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#8FA189]" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Đăng nhập nhanh với Google</span>
            </button>

            {/* Mobile-optimized redirect option */}
            <button
              onClick={() => handleGoogleSignIn(true)}
              disabled={authLoading}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#FAF9F6] border border-[#D6E0D3] hover:bg-[#EAEFE8] hover:border-[#8FA189] text-[#4E6746] text-xs font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 active:scale-[0.99]"
              title="Dành cho điện thoại nếu bị chặn popup"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#8FA189]" />
              <span>Đăng nhập Google (Chuyển hướng trang - Dành cho điện thoại)</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 h-px bg-[#E0DBCF]" />
            <span className="text-[11px] font-medium text-[#8A8479]">hoặc sử dụng Email</span>
            <div className="flex-1 h-px bg-[#E0DBCF]" />
          </div>

          {/* Tab Selection */}
          <div className="p-1 rounded-2xl bg-[#EAE7DF] flex space-x-1">
            <button
              onClick={() => {
                setAuthMode('signin');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-2 text-xs font-serif font-bold rounded-xl transition-all ${
                authMode === 'signin'
                  ? 'bg-white text-[#3D3934] shadow-xs'
                  : 'text-[#6B655B] hover:text-[#3D3934]'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-2 text-xs font-serif font-bold rounded-xl transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-[#3D3934] shadow-xs'
                  : 'text-[#6B655B] hover:text-[#3D3934]'
              }`}
            >
              Đăng ký mới
            </button>
          </div>

          {/* Auth Form Card */}
          <form
            onSubmit={handleAuthSubmit}
            className="p-5 rounded-3xl bg-white border border-[#E0DBCF] shadow-xs space-y-3.5"
          >
            {authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-[#5C574F] mb-1">
                  Tên hiển thị của bạn
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Hải Phương"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E0DBCF] focus:border-[#8FA189] focus:ring-1 focus:ring-[#8FA189] text-xs bg-[#FAF9F6] outline-hidden text-[#3D3934]"
                  />
                  <UserIcon className="w-4 h-4 text-[#8A8479] absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#5C574F] mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E0DBCF] focus:border-[#8FA189] focus:ring-1 focus:ring-[#8FA189] text-xs bg-[#FAF9F6] outline-hidden text-[#3D3934]"
                />
                <Mail className="w-4 h-4 text-[#8A8479] absolute left-3 top-3" />
              </div>
            </div>

            {authMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#5C574F]">
                    Mật khẩu
                  </label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-[11px] font-semibold text-[#8FA189] hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E0DBCF] focus:border-[#8FA189] focus:ring-1 focus:ring-[#8FA189] text-xs bg-[#FAF9F6] outline-hidden text-[#3D3934]"
                  />
                  <Lock className="w-4 h-4 text-[#8A8479] absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#8A8479] hover:text-[#3D3934]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-[#5C574F] mb-1">
                  Xác nhận lại mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E0DBCF] focus:border-[#8FA189] focus:ring-1 focus:ring-[#8FA189] text-xs bg-[#FAF9F6] outline-hidden text-[#3D3934]"
                  />
                  <Lock className="w-4 h-4 text-[#8A8479] absolute left-3 top-3" />
                </div>
              </div>
            )}

            {/* Error & Success Messages */}
            {authError && (
              <div className="p-3 rounded-xl bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63] text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 rounded-xl bg-[#EAEFE8] border border-[#D6E0D3] text-[#4E6746] text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#8FA189] hover:bg-[#7D8F77] disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-[#8FA189]/20 transition-all active:scale-[0.99]"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : authMode === 'signin' ? (
                <span>Đăng nhập ngay</span>
              ) : authMode === 'signup' ? (
                <span>Tạo tài khoản học</span>
              ) : (
                <span>Gửi email đặt lại mật khẩu</span>
              )}
            </button>

            {authMode === 'forgot' && (
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="w-full text-center text-xs text-[#8A8479] hover:text-[#3D3934] pt-1"
              >
                ← Quay lại Đăng nhập
              </button>
            )}
          </form>

          {/* Local Guest Notice */}
          <div className="p-3.5 rounded-2xl bg-[#EAEFE8]/60 border border-[#D6E0D3] text-[11px] text-[#5C574F] flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#8FA189] shrink-0 mt-0.5" />
            <p>
              Yên tâm: Tất cả {cardCount} thẻ từ vựng bạn đã học ở phiên khách này sẽ không bị mất mà được tự động chuyển vào tài khoản mới ngay sau khi đăng nhập!
            </p>
          </div>
        </div>
      ) : (
        /* Logged In Screen */
        <div className="space-y-4">
          {/* User Profile Card */}
          <div className="p-4 rounded-3xl bg-white border border-[#E0DBCF] shadow-xs space-y-4">
            <div className="flex items-center space-x-3.5">
              {/* Avatar with Edit Badge */}
              <div className="relative group">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User Avatar'}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D6E0D3] shadow-xs bg-[#FAF9F6]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#8FA189] text-white font-serif font-bold text-2xl flex items-center justify-center shadow-xs">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedAvatarUrl(user.photoURL || '');
                    setIsAvatarModalOpen(true);
                  }}
                  className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#3D3934] hover:bg-[#8FA189] text-white flex items-center justify-center shadow-xs transition-colors"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Name & Email */}
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      value={editNameInput}
                      onChange={(e) => setEditNameInput(e.target.value)}
                      placeholder="Nhập tên của bạn"
                      className="text-xs font-bold text-[#3D3934] px-2 py-1 rounded-lg border border-[#8FA189] bg-[#FAF9F6] outline-hidden w-full"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={nameLoading}
                      className="p-1 rounded-lg bg-[#8FA189] text-white hover:bg-[#7D8F77]"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-sm font-serif font-bold text-[#3D3934] truncate">
                      {user.displayName || 'Học viên'}
                    </h3>
                    <button
                      onClick={() => {
                        setEditNameInput(user.displayName || '');
                        setIsEditingName(true);
                      }}
                      className="text-[#8A8479] hover:text-[#3D3934] p-0.5 rounded"
                      title="Sửa tên hiển thị"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-[#8A8479] truncate mt-0.5">
                  {user.email}
                </p>

                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EAEFE8] text-[#4E6746] border border-[#D6E0D3]">
                    {isGoogleProvider ? 'Google Sync' : 'Email/Password'}
                  </span>
                  <span className="text-[10px] text-[#8A8479]">
                    • Đang kết nối
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E0DBCF]/50">
              <button
                onClick={() => {
                  setSelectedAvatarUrl(user.photoURL || '');
                  setIsAvatarModalOpen(true);
                }}
                className="py-2 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#EAEFE8] border border-[#E0DBCF] hover:border-[#D6E0D3] text-[11px] font-semibold text-[#5C574F] hover:text-[#4E6746] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-[#8FA189]" />
                <span>Thay Avatar</span>
              </button>

              <button
                onClick={() => {
                  setPasswordError(null);
                  setPasswordSuccess(null);
                  setIsPasswordModalOpen(true);
                }}
                className="py-2 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#EAEFE8] border border-[#E0DBCF] hover:border-[#D6E0D3] text-[11px] font-semibold text-[#5C574F] hover:text-[#4E6746] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#8FA189]" />
                <span>Đổi mật khẩu</span>
              </button>
            </div>
          </div>

          {/* Cloud Database Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-white border border-[#E0DBCF] text-center shadow-xs">
              <div className="text-lg font-serif font-bold text-[#3D3934]">
                {cardCount}
              </div>
              <div className="text-[10px] font-bold text-[#8A8479] uppercase tracking-wider mt-0.5">
                Thẻ lưu mây
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#E0DBCF] text-center shadow-xs">
              <div className="text-lg font-serif font-bold text-[#3D3934]">
                {deckCount}
              </div>
              <div className="text-[10px] font-bold text-[#8A8479] uppercase tracking-wider mt-0.5">
                Bộ bài học
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FBF2EE] border border-[#F2D7CD] text-center shadow-xs">
              <div className="text-lg font-serif font-bold text-[#C27D63]">
                {progress.dailyStreak} ngày
              </div>
              <div className="text-[10px] font-bold text-[#C27D63] uppercase tracking-wider mt-0.5">
                Chuỗi Streak
              </div>
            </div>
          </div>

          {/* Cloud Synchronization Status & Action */}
          <div className="p-4 rounded-3xl bg-white border border-[#E0DBCF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAEFE8] text-[#8FA189] flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#3D3934]">
                    Trạng thái Firestore Cloud
                  </h4>
                  <p className="text-[10px] text-[#8A8479]">
                    {lastSyncedAt
                      ? `Lần cuối: ${lastSyncedAt.toLocaleTimeString('vi-VN')}`
                      : 'Đã sẵn sàng đồng bộ'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-[#4E6746] bg-[#EAEFE8] border border-[#D6E0D3] px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Hoạt động</span>
              </span>
            </div>

            <button
              onClick={handleTriggerSync}
              disabled={syncLoading || isSyncing}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#EAEFE8] border border-[#E0DBCF] hover:border-[#D6E0D3] text-xs font-semibold text-[#5C574F] hover:text-[#4E6746] flex items-center justify-center space-x-2 transition-colors disabled:opacity-60"
            >
              {syncLoading || isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8FA189]" />
                  <span>Đang tải lên cơ sở dữ liệu Firebase...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#8FA189]" />
                  <span>Đồng bộ dữ liệu ngay lập tức</span>
                </>
              )}
            </button>
          </div>

          {/* Settings & Learning Path Shortcut */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E0DBCF] shadow-xs space-y-2">
            <h4 className="text-[11px] font-serif font-bold text-[#8A8479] uppercase tracking-wider px-1">
              Cài đặt ứng dụng
            </h4>

            {onOpenPreferences && (
              <button
                onClick={onOpenPreferences}
                className="w-full p-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#EAEFE8] border border-[#E0DBCF] text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#EAEFE8] text-[#4E6746] flex items-center justify-center">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#3D3934]">
                      Lộ trình & Trình độ học
                    </div>
                    <div className="text-[10px] text-[#8A8479]">
                      Cấp độ: {preferences?.level || 'B1-B2'} • Mục tiêu: {preferences?.dailyGoal || 6} từ/ngày
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A8479] group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Global Error/Success in Logged-in State */}
            {authError && (
              <div className="p-3 rounded-xl bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63] text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={authLoading}
              className="w-full p-2.5 rounded-xl bg-white hover:bg-[#FBF2EE] border border-[#E0DBCF] hover:border-[#F2D7CD] text-left flex items-center justify-between text-[#8A8479] hover:text-[#C27D63] transition-colors disabled:opacity-50 active:scale-[0.99]"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] text-[#8A8479] flex items-center justify-center">
                  {authLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C27D63]" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5 text-[#C27D63]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#C27D63]">
                    {authLoading ? 'Đang đăng xuất...' : 'Đăng xuất tài khoản'}
                  </div>
                  <div className="text-[10px] text-[#8A8479]">
                    Đăng xuất khỏi thiết bị này an toàn
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8A8479]" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: THAY ĐỔI AVATAR (AVATAR PICKER & UPLOAD)          */}
      {/* ========================================================= */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#3D3934]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#FAF9F6] rounded-t-3xl sm:rounded-[28px] max-h-[90vh] flex flex-col shadow-2xl border border-[#E0DBCF] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E0DBCF] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAEFE8] text-[#8FA189] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#3D3934]">
                    Chọn Ảnh đại diện (Avatar)
                  </h3>
                  <p className="text-[10px] text-[#8A8479]">
                    Chọn ảnh có sẵn hoặc tải ảnh riêng của bạn
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 rounded-full text-[#8A8479] hover:text-[#3D3934] hover:bg-[#EBE7DF]"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Preview Current Selection */}
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="relative">
                  {selectedAvatarUrl ? (
                    <img
                      src={selectedAvatarUrl}
                      alt="Selected Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#8FA189] shadow-md bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#EAEFE8] text-[#8FA189] flex items-center justify-center border-2 border-dashed border-[#8FA189]">
                      <UserIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#8FA189] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
                <span className="text-[11px] text-[#8A8479]">
                  Ảnh đại diện hiển thị trên hồ sơ học tập
                </span>
              </div>

              {/* Preset Avatars Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-serif font-bold text-[#5C574F]">
                  Bộ sưu tập Avatar học tập
                </h4>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((item) => {
                    const isSelected = selectedAvatarUrl === item.url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(item.url)}
                        className={`p-1.5 rounded-2xl border flex flex-col items-center space-y-1 transition-all ${
                          isSelected
                            ? 'border-[#8FA189] bg-[#EAEFE8] ring-2 ring-[#8FA189]/50 shadow-xs'
                            : 'border-[#E0DBCF] bg-white hover:border-[#8FA189]'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <span className="text-[9px] font-medium text-[#5C574F] truncate max-w-[60px]">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Custom File */}
              <div className="space-y-2 pt-2 border-t border-[#E0DBCF]">
                <h4 className="text-xs font-serif font-bold text-[#5C574F]">
                  Hoặc tải ảnh từ máy của bạn
                </h4>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-dashed border-[#8FA189] hover:bg-[#EAEFE8]/50 text-xs font-semibold text-[#4E6746] flex items-center justify-center space-x-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp ảnh từ thiết bị (Tối đa 1MB)</span>
                </button>
              </div>

              {/* Custom Image URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5C574F]">
                  Hoặc dán link ảnh trực tiếp (URL)
                </label>
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => {
                    setCustomAvatarUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setSelectedAvatarUrl(e.target.value.trim());
                    }
                  }}
                  placeholder="https://example.com/my-photo.jpg"
                  className="w-full px-3 py-2 rounded-xl border border-[#E0DBCF] text-xs bg-white outline-hidden focus:border-[#8FA189]"
                />
              </div>

              {avatarError && (
                <div className="p-2.5 rounded-xl bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63] text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{avatarError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E0DBCF] bg-[#FAF9F6] flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E0DBCF] text-xs font-semibold text-[#5C574F] hover:bg-[#EBE7DF]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={avatarLoading || !selectedAvatarUrl}
                className="flex-1 py-2.5 rounded-xl bg-[#8FA189] hover:bg-[#7D8F77] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
              >
                {avatarLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Lưu Avatar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ĐỔI MẬT KHẨU (CHANGE PASSWORD)                     */}
      {/* ========================================================= */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#3D3934]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#FAF9F6] rounded-t-3xl sm:rounded-[28px] max-h-[90vh] flex flex-col shadow-2xl border border-[#E0DBCF] overflow-hidden">
            <div className="p-4 border-b border-[#E0DBCF] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAEFE8] text-[#8FA189] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#3D3934]">
                    Cài đặt Mật khẩu
                  </h3>
                  <p className="text-[10px] text-[#8A8479]">
                    Cập nhật mật khẩu mới cho tài khoản của bạn
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-full text-[#8A8479] hover:text-[#3D3934] hover:bg-[#EBE7DF]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-4 space-y-3.5">
              {isGoogleProvider ? (
                <div className="p-4 rounded-2xl bg-[#EAEFE8] border border-[#D6E0D3] space-y-2 text-center">
                  <ShieldCheck className="w-8 h-8 text-[#8FA189] mx-auto" />
                  <h4 className="text-xs font-bold text-[#3D3934]">
                    Tài khoản đăng nhập Google
                  </h4>
                  <p className="text-xs text-[#5C574F] leading-relaxed">
                    Tài khoản của bạn được bảo vệ qua hệ thống Google Identity. Bạn không cần đặt mật khẩu riêng trong ứng dụng này. Mọi bảo mật đều do tài khoản Google của bạn quản lý.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C574F] mb-1">
                      Mật khẩu hiện tại (nếu có)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E0DBCF] focus:border-[#8FA189] text-xs bg-white outline-hidden text-[#3D3934]"
                      />
                      <Lock className="w-4 h-4 text-[#8A8479] absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-[#5C574F]">
                        Mật khẩu mới
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-[10px] text-[#8A8479] hover:text-[#3D3934]"
                      >
                        {showNewPassword ? 'Ẩn' : 'Hiện'} mật khẩu
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ít nhất 6 ký tự"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E0DBCF] focus:border-[#8FA189] text-xs bg-white outline-hidden text-[#3D3934]"
                      />
                      <Lock className="w-4 h-4 text-[#8A8479] absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5C574F] mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E0DBCF] focus:border-[#8FA189] text-xs bg-white outline-hidden text-[#3D3934]"
                      />
                      <Lock className="w-4 h-4 text-[#8A8479] absolute left-3 top-3" />
                    </div>
                  </div>

                  {passwordError && (
                    <div className="p-3 rounded-xl bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63] text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 rounded-xl bg-[#EAEFE8] border border-[#D6E0D3] text-[#4E6746] text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#E0DBCF] text-xs font-semibold text-[#5C574F] hover:bg-[#EBE7DF]"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex-1 py-2.5 rounded-xl bg-[#8FA189] hover:bg-[#7D8F77] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
                    >
                      {passwordLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Lưu mật khẩu</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
