export interface HomepagePost {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  author?: string;
  image_url?: string;  
}

export interface HomepageFeed {
  status: string;
  latest_post?: HomepagePost;
  popular_posts: HomepagePost[];
}