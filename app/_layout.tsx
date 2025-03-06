import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarBackgroundColor: "#000",
        contentStyle: { backgroundColor: "#000" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          animation: "fade",
          statusBarColor: "#000",
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          animation: "slide_from_right",
          statusBarColor: "#001100",
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
