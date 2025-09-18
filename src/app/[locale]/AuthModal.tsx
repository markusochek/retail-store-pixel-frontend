'use client';

import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

type AuthMode = 'login' | 'register';

interface FormData {
  email: string;
  password: string;
}

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setModalIsOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }

    return () => {
      setModalIsOpen(false);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>();

  const signUp = async (credentials: FormData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка регистрации');
    }

    return await response.json();
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const result = await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (result?.error) {
          setError(result.error);
          return;
        }

        handleSuccess();
      } else {
        await signUp(data);

        const result = await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (result?.error) {
          setError(result.error);
          return;
        }

        handleSuccess();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Произошла ошибка при входе после регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    router.refresh();
    onClose();
    reset();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    reset();
  };

  const passwordValue = watch('password');

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      onAfterClose={() => {
        setError('');
        reset();
      }}
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          maxWidth: '400px',
          width: '90%',
          padding: '0',
          border: 'none',
          borderRadius: '12px',
          overflow: 'hidden',
        },
      }}
    >
      <div className="bg-white p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email', {
                required: 'Обязательное поле',
                pattern: {
                  value: /^\S+@\S+\.\S+$/i,
                  message: 'Введите корректный email',
                },
              })}
              type="email"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Пароль</label>
            <input
              {...register('password', {
                required: 'Обязательное поле',
                minLength: {
                  value: 6,
                  message: 'Минимум 6 символов',
                },
                validate:
                  mode === 'register'
                    ? {
                        hasUpperCase: value =>
                          /[A-Z]/.test(value) || 'Должна быть хотя бы одна заглавная буква',
                        hasLowerCase: value =>
                          /[a-z]/.test(value) || 'Должна быть хотя бы одна строчная буква',
                        hasNumber: value => /\d/.test(value) || 'Должна быть хотя бы одна цифра',
                      }
                    : undefined,
              })}
              type="password"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Введите пароль"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {mode === 'register' && passwordValue && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Пароль должен содержать:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className={passwordValue.length >= 6 ? 'text-green-600' : ''}>
                  ✓ Минимум 6 символов
                </li>
                <li className={/[A-Z]/.test(passwordValue) ? 'text-green-600' : ''}>
                  ✓ Заглавную букву
                </li>
                <li className={/[a-z]/.test(passwordValue) ? 'text-green-600' : ''}>
                  ✓ Строчную букву
                </li>
                <li className={/\d/.test(passwordValue) ? 'text-green-600' : ''}>✓ Цифру</li>
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'login' ? 'Вход...' : 'Регистрация...'}
              </div>
            ) : mode === 'login' ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={switchMode}
            disabled={isLoading}
            className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
          >
            {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
