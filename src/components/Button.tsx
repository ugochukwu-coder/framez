import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-black border-black',
    secondary: 'bg-gray-500 border-gray-500', 
    outline: 'bg-transparent border-gray-300'
  };

  const textClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-gray-900'
  };

  return (
    <TouchableOpacity
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${variantClasses[variant]}
        border rounded-lg py-3 px-4
        flex-row justify-center items-center
        ${disabled ? 'opacity-50' : ''}
      `}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'outline' ? '#000' : '#fff'} className="mr-2" />}
      <Text className={`${textClasses[variant]} font-semibold text-center`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}