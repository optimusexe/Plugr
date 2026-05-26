export type ProfileMode = "provider" | "requester" | "both";

export type VerificationStatus = "pending" | "verified";

export type ProfileProduct = {
  id: string;
  name: string;
  price?: string;
  description?: string;
  image?: string;
};

export type StudentProfile = {
  id: string;
  userId: string;
  profileImage?: string;
  products?: ProfileProduct[];
  fullName: string;
  faculty: string;
  department: string;
  level: string;
  phone: string;
  email?: string;
  locationText: string;
  mapLink?: string;
  primarySkill?: string;
  bio?: string;
  mode: ProfileMode;
  verificationStatus: VerificationStatus;
  credibility: number;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPayload = {
  userId: string;
  profileImage?: string;
  products?: ProfileProduct[];
  fullName: string;
  faculty: string;
  department: string;
  level: string;
  phone: string;
  email?: string;
  locationText: string;
  mapLink?: string;
  primarySkill?: string;
  bio?: string;
  mode: ProfileMode;
};

export type UserAccount = {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  verified: boolean;
  isAdmin: boolean;
  deactivatedUntil?: string;
  verificationCode?: string;
  verificationCodeExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType = "system" | "admin-broadcast" | "event";

export type Notification = {
  id: string;
  broadcastId?: string;
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  type: NotificationType;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationSummary = Notification & {
  isRead: boolean;
};

export type NotificationBroadcastPayload = {
  title: string;
  message: string;
  actionUrl?: string;
  target: "all" | "specific";
  userIds?: string[];
};

export type AdminBroadcastSummary = {
  broadcastId: string;
  title: string;
  message: string;
  actionUrl?: string;
  type: NotificationType;
  recipientCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AuthRegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type ContactChannel = "call" | "whatsapp" | "email";

export type InteractionStatus =
  | "pending"
  | "consumer_confirmed"
  | "provider_confirmed"
  | "mutually_confirmed"
  | "consumer_declined"
  | "provider_declined";

export type ServiceInteraction = {
  id: string;
  providerId: string;
  providerUserId: string;
  consumerId: string;
  contactChannel: ContactChannel;
  status: InteractionStatus;
  consumerConfirmed: boolean;
  providerConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProviderReview = {
  id: string;
  interactionId: string;
  providerId: string;
  providerUserId: string;
  consumerId: string;
  rating: number;
  comment?: string;
  confidenceWeight: number;
  createdAt: string;
};

export type SupportConversationStatus = "open" | "waiting_admin" | "waiting_user" | "closed";

export type SupportMessageSender = "user" | "admin" | "system";

export type SupportConversation = {
  id: string;
  userId: string;
  subject: string;
  status: SupportConversationStatus;
  assignedAdminId?: string;
  lastMessageAt: string;
  waitingSince?: string;
  firstNoticeSentAt?: string;
  secondNoticeSentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SupportMessage = {
  id: string;
  conversationId: string;
  senderRole: SupportMessageSender;
  senderUserId?: string;
  body: string;
  createdAt: string;
};

export type SupportConversationView = {
  conversation: SupportConversation;
  messages: SupportMessage[];
  user?: UserAccount | null;
  profile?: StudentProfile | null;
};

export type SupportConversationSummary = {
  conversation: SupportConversation;
  messages: SupportMessage[];
  user?: UserAccount | null;
  profile?: StudentProfile | null;
  lastMessage?: SupportMessage | null;
};

export type VerificationCheckType =
  | "email_verified"
  | "phone_verified"
  | "faculty_id_verified"
  | "profile_photo_verified"
  | "profile_complete"
  | "bio_verified";

export type VerificationCheck = {
  id: string;
  userId: string;
  checkType: VerificationCheckType;
  completed: boolean;
  description: string;
  actionUrl?: string;
  icon: string;
  createdAt: string;
  completedAt?: string;
  // Email verification
  emailAddress?: string;
  emailOtpCode?: string;
  emailOtpExpiry?: string;
  emailOtpAttempts?: number;
  // Phone verification
  phoneNumber?: string;
  phoneOtpCode?: string;
  phoneOtpExpiry?: string;
  phoneOtpAttempts?: number;
  // ID verification
  idDocumentUrl?: string;
  idDocumentName?: string;
};

export type VerificationProgress = {
  userId: string;
  totalChecks: number;
  completedChecks: number;
  percentageComplete: number;
  checks: VerificationCheck[];
};
