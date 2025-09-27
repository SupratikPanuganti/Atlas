import type { NavigatorScreenParams } from '@react-navigation/native'

export type RootStackParamList = {
  Auth: undefined
  Main: NavigatorScreenParams<MainTabParamList>
  LivePricing: { lineId: string; lineData: any; stake?: number; potential?: number }
  Transparency: { lineId: string; lineData: any }
  WatchMode: { momentId: string; momentData: any }
  Settings: undefined
}

export type MainTabParamList = {
  Home: undefined
  Radar: undefined
  Chats: { targetPropId?: string; ensureCreate?: boolean } | undefined
}

export type AuthStackParamList = {
  Welcome: undefined
  Login: undefined
  Signup: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
