import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForkKnife } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import Card from '@/components/Card';
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

  React.useEffect(() => {
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
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      style={[styles.input, { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
      testID={testID}
    />
  );
}

function LoginForm() {
  const { login, resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      return;
    }

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
      <Pressable onPress={handleLogin} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed, isSubmitting && styles.primaryButtonPressed]} disabled={isSubmitting} testID="login-submit-button">
        {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Log In</Text>}
      </Pressable>
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
      return;
    }

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
      <Pressable onPress={handleSignup} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed, isSubmitting && styles.primaryButtonPressed]} disabled={isSubmitting} testID="signup-submit-button">
        {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
      </Pressable>
    </View>
  );
}

function AuthRootView() {
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [mode, setMode] = useState<AuthMode>('login');
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const toggleMode = useCallback((nextMode: AuthMode) => {
    if (nextMode === mode) return;

    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slide, { toValue: nextMode === 'signup' ? -20 : 20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setMode(nextMode);
      slide.setValue(nextMode === 'signup' ? 20 : -20);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    });
  }, [fade, mode, slide]);

  return (
    <View style={styles.authShell}>
      <View style={[styles.logoCircle, { backgroundColor: colors.brandPrimary }]}>
        <ForkKnife size={34} color="#FFFFFF" />
      </View>
      <Text style={[styles.brandTitle, { color: colors.brandPrimary }]}>Ram Café</Text>
      <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your campus dining, simplified.</Text>
      <Card style={styles.authCard}>
        <Animated.View style={{ opacity: fade, transform: [{ translateX: slide }] }}>
          {mode === 'login' ? <LoginForm /> : <SignupForm />}
        </Animated.View>
        <Pressable onPress={() => toggleMode(mode === 'login' ? 'signup' : 'login')} testID="auth-toggle-button">
          <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
            {mode === 'login' ? 'New here? ' : 'Already have an account? '}
            <Text style={[styles.toggleTextStrong, { color: colors.brandPrimary }]}>{mode === 'login' ? 'Create an account' : 'Log in'}</Text>
          </Text>
        </Pressable>
      </Card>
    </View>
  );
}

export default function RootScreen() {
  const { currentUser, needsOnboarding, resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);

  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundMain }]} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <AuthRootView />
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  authShell: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 15,
    marginTop: 6,
    marginBottom: 24,
  },
  authCard: {
    width: '100%',
    padding: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
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
    color: '#D32F2F',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  toggleText: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 14,
  },
  toggleTextStrong: {
    fontWeight: '700' as const,
  },
});
