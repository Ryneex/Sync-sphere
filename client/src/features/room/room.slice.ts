import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RoomType } from "../../schemas/roomSchema";
import { RootState } from "../../app/store";

interface RoomState {
  allRooms: RoomType[];
}

const initialState: RoomState = {
  allRooms: [],
};

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setAllRooms: (state, action: PayloadAction<RoomType[]>) => {
      state.allRooms = action.payload;
    },
    addRoom: (state, action: PayloadAction<RoomType>) => {
      state.allRooms.push(action.payload);
    },
  },
});

export const { setAllRooms, addRoom } = roomSlice.actions;
export default roomSlice.reducer;

// selectors
export const selectAllRooms = (state: RootState) => {
  return state.room.allRooms;
};
