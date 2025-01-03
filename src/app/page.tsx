"use client"
import { Game } from "@/components/game/game";
import { myStore } from "@/store/store";
import { Provider } from "jotai";
import React from "react";

export default function Home() {

  return (
    <Provider store={myStore}>
      {/* <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20"> */}
      <div
        className="h-screen w-screen flex items-center justify-center"
      >
        <Game />
      </div>
      {/* </div > */}
    </Provider>
  );
}
