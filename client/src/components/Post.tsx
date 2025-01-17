export interface PostData {
  title: string;
  content: string;
  student: {
    email: string;
  };
}

interface PostProps {
  post: PostData;
}

function Post({ post }: PostProps) {
  return (
    <div>
      <h1>
        owner:{post.student.email} title:{post.title}
      </h1>
      <h2>{post.content}</h2>
    </div>
  );
}

export default Post;
