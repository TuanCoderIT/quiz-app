import { Redirect, useLocalSearchParams } from "expo-router";
import React from "react";

export default function StartQuizRedirection() {
  const { id } = useLocalSearchParams();

  return (
    <Redirect
      href={{
        pathname: "/quiz/take",
        params: { id: String(id) },
      }}
    />
  );
}
