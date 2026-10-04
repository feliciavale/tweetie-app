interface FormattablePost {
  id: string;
  content: string;
  createdAt: Date;
  author: { username: string };
  _count: { likes: number; reposts: number };
  likes: { id: string }[];
  reposts: { id: string }[];
  quotedPost: {
    id: string;
    content: string;
    createdAt: Date;
    author: { username: string };
  } | null;
}

export const postListingInclude = {
  author: { select: { username: true } },
  _count: { select: { likes: true, reposts: true } },
  quotedPost: {
    include: {
      author: { select: { username: true } },
    },
  },
};

export function likeAndRepostInclude(userId: string) {
  return {
    likes: { where: { userId }, select: { id: true } },
    reposts: { where: { userId }, select: { id: true } },
  };
}

export function formatPost(p: FormattablePost) {
  return {
    id: p.id,
    name: p.author.username,
    handle: `@${p.author.username}`,
    timestamp: p.createdAt.toISOString(),
    content: p.content,
    likeCount: p._count.likes,
    repostCount: p._count.reposts,
    likedByMe: p.likes.length > 0,
    repostedByMe: p.reposts.length > 0,
    quotedPost: p.quotedPost
      ? {
          id: p.quotedPost.id,
          name: p.quotedPost.author.username,
          handle: `@${p.quotedPost.author.username}`,
          timestamp: p.quotedPost.createdAt.toISOString(),
          content: p.quotedPost.content,
        }
      : null,
  };
}
