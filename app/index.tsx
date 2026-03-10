import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getColors } from '@/constants/colors';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useSession } from '@/contexts/SessionContext';
import { ADMIN_EMAIL, SCHOOL_DOMAIN } from '@/mocks/data';
import { User } from '@/types';

type AuthMode = 'login' | 'signup';

interface LoginErrors {
  form?: string;
  email?: string;
}

interface SignupErrors {
  form?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function getFirstName(name?: string): string {
  const trimmed = name?.trim() ?? '';
  return trimmed.split(' ')[0] || 'Student';
}

function ErrorText({ message }: { message?: string }) {
  const animatedOpacity = useRef(new Animated.Value(message ? 1 : 0)).current;
  const animatedTranslateY = useRef(new Animated.Value(message ? 0 : -4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: message ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedTranslateY, {
        toValue: message ? 0 : -4,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [animatedOpacity, animatedTranslateY, message]);

  return (
    <Animated.View style={[styles.errorWrap, { opacity: animatedOpacity, transform: [{ translateY: animatedTranslateY }] }]}>
      <Text style={styles.errorText}>{message ?? ' '}</Text>
    </Animated.View>
  );
}

function AuthInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  testID,
  colors,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  testID: string;
  colors: ReturnType<typeof getColors>;
}) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    Animated.parallel([
      Animated.timing(focusAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1.01, useNativeDriver: true, speed: 50, bounciness: 4 }),
    ]).start();
  };

  const handleBlur = () => {
    Animated.parallel([
      Animated.timing(focusAnim, { toValue: 0, duration: 250, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }),
    ]).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderSubtle, colors.brandPrimary],
  });

  const borderWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2],
  });

  return (
    <Animated.View style={[styles.inputWrap, { borderColor, borderWidth, transform: [{ scale: scaleAnim }] }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[styles.input, { backgroundColor: colors.backgroundCard, color: colors.textPrimary }]}
        testID={testID}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Animated.View>
  );
}

function LoginForm() {
  const { login, resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleLogin = useCallback(() => {
    console.log('[Auth] Attempting login for email:', email);
    const trimmedEmail = email.trim().toLowerCase();
    const nextErrors: LoginErrors = {};

    if (!trimmedEmail || !password.trim()) {
      nextErrors.form = 'Please fill in all fields.';
    }

    if (trimmedEmail && trimmedEmail !== ADMIN_EMAIL && !trimmedEmail.endsWith(`@${SCHOOL_DOMAIN}`)) {
      nextErrors.email = `Please use your school email (…@${SCHOOL_DOMAIN}).`;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    setTimeout(() => {
      const isAdmin = trimmedEmail === ADMIN_EMAIL;
      const user: User = {
        id: `user-${Date.now()}`,
        name: isAdmin ? 'Campus Admin' : getFirstName(trimmedEmail.split('@')[0]),
        email: trimmedEmail,
        role: isAdmin ? 'admin' : 'student',
        profile: isAdmin
          ? undefined
          : {
              dietaryRestrictions: [],
              allergies: [],
              hasCompletedOnboarding: true,
            },
      };

      login(user, { needsOnboarding: false });
      setIsSubmitting(false);
    }, 600);
  }, [email, login, password]);

  return (
    <View>
      <AuthInput value={email} onChangeText={setEmail} placeholder="School email" keyboardType="email-address" autoCapitalize="none" testID="login-email-input" colors={colors} />
      <ErrorText message={errors.email ?? errors.form} />
      <AuthInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry autoCapitalize="none" testID="login-password-input" colors={colors} />
      <ErrorText message={undefined} />
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Pressable
          onPress={handleLogin}
          onPressIn={() => Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start()}
          onPressOut={() => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start()}
          style={[styles.primaryButton, { backgroundColor: colors.brandPrimary }]}
          disabled={isSubmitting}
          testID="login-submit-button"
        >
          {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Log In</Text>}
        </Pressable>
      </Animated.View>
    </View>
  );
}

function SignupForm() {
  const { login, resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleSignup = useCallback(() => {
    console.log('[Auth] Attempting signup for email:', email);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const nextErrors: SignupErrors = {};

    if (!trimmedName || !trimmedEmail || !password.trim() || !confirmPassword.trim()) {
      nextErrors.form = 'Please fill in all fields.';
    }

    if (trimmedEmail && !trimmedEmail.endsWith(`@${SCHOOL_DOMAIN}`)) {
      nextErrors.email = `Students must sign up with their school email (…@${SCHOOL_DOMAIN}).`;
    }

    if (password && password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    if (confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    setTimeout(() => {
      const user: User = {
        id: `user-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        role: 'student',
      };
      login(user, { needsOnboarding: true });
      setIsSubmitting(false);
    }, 600);
  }, [confirmPassword, email, login, name, password]);

  return (
    <View>
      <AuthInput value={name} onChangeText={setName} placeholder="Full name" autoCapitalize="words" testID="signup-name-input" colors={colors} />
      <ErrorText message={errors.form} />
      <AuthInput value={email} onChangeText={setEmail} placeholder="School email" keyboardType="email-address" autoCapitalize="none" testID="signup-email-input" colors={colors} />
      <ErrorText message={errors.email} />
      <AuthInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry autoCapitalize="none" testID="signup-password-input" colors={colors} />
      <ErrorText message={errors.password} />
      <AuthInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" secureTextEntry autoCapitalize="none" testID="signup-confirm-password-input" colors={colors} />
      <ErrorText message={errors.confirmPassword} />
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Pressable
          onPress={handleSignup}
          onPressIn={() => Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start()}
          onPressOut={() => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start()}
          style={[styles.primaryButton, { backgroundColor: colors.brandPrimary }]}
          disabled={isSubmitting}
          testID="signup-submit-button"
        >
          {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
        </Pressable>
      </Animated.View>
    </View>
  );
}

function AuthRootView() {
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [mode, setMode] = useState<AuthMode>('login');
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(12)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, [logoScale, logoOpacity, titleFade, titleSlide, cardFade, cardSlide]);

  const toggleMode = useCallback((nextMode: AuthMode) => {
    if (nextMode === mode) return;
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slide, { toValue: nextMode === 'signup' ? -20 : 20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setMode(nextMode);
      slide.setValue(nextMode === 'signup' ? 20 : -20);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  }, [fade, mode, slide]);

  return (
    <View style={styles.authShell}>
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleSlide }] }}>
        <Text style={[styles.brandTitle, { color: colors.brandPrimary }]}>Ram Café</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Huston-Tillotson University Dining</Text>
      </Animated.View>

      <Animated.View style={[styles.authCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow, opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
        <View style={[styles.tabRow, { backgroundColor: colors.surfaceTimeBlock, borderRadius: 14, padding: 3 }]}>
          <Pressable
            onPress={() => toggleMode('login')}
            style={[styles.tabButton, mode === 'login' && [styles.tabButtonActive, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]]}
          >
            <Text style={[styles.tabButtonText, { color: mode === 'login' ? colors.brandPrimary : colors.textSecondary }]}>Log In</Text>
          </Pressable>
          <Pressable
            onPress={() => toggleMode('signup')}
            style={[styles.tabButton, mode === 'signup' && [styles.tabButtonActive, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]]}
          >
            <Text style={[styles.tabButtonText, { color: mode === 'signup' ? colors.brandPrimary : colors.textSecondary }]}>Sign Up</Text>
          </Pressable>
        </View>
        <Animated.View style={{ opacity: fade, transform: [{ translateX: slide }] }}>
          {mode === 'login' ? <LoginForm /> : <SignupForm />}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export default function RootScreen() {
  const { currentUser, needsOnboarding, resolvedColorScheme, highContrastEnabled, isLoadingSession } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const splashLogoScale = useRef(new Animated.Value(0.8)).current;
  const splashLogoOpacity = useRef(new Animated.Value(0)).current;
  const splashPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoadingSession) {
      Animated.parallel([
        Animated.spring(splashLogoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(splashLogoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(splashPulse, { toValue: 1.05, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(splashPulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ])
        ).start();
      });
    }
  }, [isLoadingSession, splashLogoScale, splashLogoOpacity, splashPulse]);

  if (isLoadingSession) {
    return (
      <View style={[styles.safeArea, { backgroundColor: colors.backgroundMain, justifyContent: 'center', alignItems: 'center' }]}>
        <Animated.View style={{ opacity: splashLogoOpacity, transform: [{ scale: Animated.multiply(splashLogoScale, splashPulse) }] }}>
          <Image source={require('@/assets/images/logo.png')} style={{ width: 130, height: 130 }} resizeMode="contain" />
        </Animated.View>
        <Animated.View style={{ opacity: splashLogoOpacity, marginTop: 20 }}>
          <Text style={[styles.splashTitle, { color: colors.brandPrimary }]}>Ram Café</Text>
        </Animated.View>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundMain }]} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <AuthRootView />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (needsOnboarding) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundMain }]} edges={['top', 'bottom']}>
        <OnboardingFlow />
      </SafeAreaView>
    );
  }

  if (currentUser.role === 'admin') {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/today" />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  authShell: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },
  logoImage: {
    width: 110,
    height: 110,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 30,
    textAlign: 'center',
  },
  authCard: {
    width: '100%',
    borderRadius: 22,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 6 },
      web: {
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
    }),
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabButtonActive: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
      web: {
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  inputWrap: {
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  errorWrap: {
    minHeight: 22,
    justifyContent: 'center',
    paddingTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#C93535',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
