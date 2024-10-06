// lib/types.ts
export interface AttendanceRecord {
    id?: number;
    USERID: number;
    CHECKTIME: string;
    CHECKTYPE: 'IN' | 'OUT';
    VERIFYCODE?: number;
    SENSORID?: number;
    Memoinfo?: string;
    WorkCode?: number;
    sn?: string;
    UserExtFmt?: string;
  }
  