
import { Hotel } from './ADMIN006Res.interface';

export interface ADMIN001Res {
  MWHEADER: {
    RETURNCODE: string;
    RETURNDESC: string;
  };
  TRANRS: {
    hotels: Hotel[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}