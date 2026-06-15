import { Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  label: string;
};

export default function ProfileInput({
  label,
  multiline,
  ...props
}: Props) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm font-semibold text-gray-700">
        {label}
      </Text>

      <TextInput
        {...props}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor="#9CA3AF"
        className={`rounded-xl bg-gray-50 px-4 text-base text-gray-900 ${
          multiline ? "h-28 py-3" : "h-12"
        }`}
      />
    </View>
  );
}