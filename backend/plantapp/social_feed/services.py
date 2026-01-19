from .models import Post

def create_post(creator, data):

    post = Post.objects.create(
        author=creator,
        content=data.get("content"),
        image=data.get("image"),
        garden=data.get("garden"),
        plant=data.get("plant")
    )
    print(f"Created post: {post}")  # Uses __str__()
    return post