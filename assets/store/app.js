import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

// Actions

export const setAppName = createAsyncThunk("app/setAppName", async (name) => {
  const { nonce } = window.wpify;
  const body = { name, nonce };

  try {
    const response = await fetch(`${window.wpify.restUrl}/set-app-name/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": nonce,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Cannot set app name");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
});

// Slice

export const appSlice = createSlice({
  name: "app",
  initialState: {},
  reducers: {},
  extraReducers: {
    [setAppName.fulfilled]: (state, action) => {
      state.name = action.payload.name;
    },
  },
});

// Selectors

const appSelector = (state) => state[appSlice.name] || {};

export const getAppName = createSelector(
  appSelector,
  (sliceState) => sliceState.name
);
