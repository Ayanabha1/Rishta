export interface IRedeemCatalogueItem {
  id: string;
  name: string;
  category: string;
  description: string;
  points_required: number;
  image_url: string | null;
  product_link: string | null;
  start_date: string | null;
  end_date: string | null;
  is_featured: boolean;
  display_order: number;
  terms_conditions: string;
}

export interface IRedeemCataloguePagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface IRedeemCatalogueListData {
  pagination: IRedeemCataloguePagination;
  items: IRedeemCatalogueItem[];
}

export interface IRedeemCatalogueApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type IRedeemCatalogueListResponse =
  IRedeemCatalogueApiResponse<IRedeemCatalogueListData>;

export type IRedeemCatalogueDetailResponse =
  IRedeemCatalogueApiResponse<IRedeemCatalogueItem>;
