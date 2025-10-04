import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import { IClassify } from '../api/classify/indexedDB'
import { ICustomTool } from '../api/customTool/indexedDB'

interface GlobalStateProps {
  language: 'chinese' | 'english' | 'japanese',
  classify: Array<IClassify>,
  customTool: Array<ICustomTool>,
}

export const globalStateSlice = createSlice({
  name: 'global',
  initialState: {
    language: 'chinese',
    classify: [],
    customTool: [],
  } as GlobalStateProps,
  reducers: {
    setGlobalState: (
      state: GlobalStateProps,
      action: PayloadAction<{
        [key in keyof GlobalStateProps]?: GlobalStateProps[key]
      }>
    ) => {
      const { language, classify, customTool } = action.payload
      if (language !== undefined) state.language = language
      if (classify !== undefined) state.classify = classify
      if (customTool !== undefined) state.customTool = customTool
    }
  }
})

export const { setGlobalState } = globalStateSlice.actions
export const selectGlobal = (state: RootState) => state.global
export default globalStateSlice.reducer
