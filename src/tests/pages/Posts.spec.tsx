import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { getPrismicClient } from "../../services/prismic";

import Posts, { getStaticProps } from "../../pages/posts";

const posts: Array<{
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}> = [
  {
    slug: "my-first-post",
    title: "My First Post",
    excerpt: "this is my first post",
    updatedAt: "10 de abril",
  },
  {
    slug: "my-second-post",
    title: "My Second Post",
    excerpt: "this is my first post",
    updatedAt: "25 de março",
  },
];

jest.mock("../../services/prismic");

describe("Posts page ", () => {
  it("renders correctly", () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText("My First Post")).toBeInTheDocument();
    expect(screen.getByText("My Second Post")).toBeInTheDocument();
  });

  it("loads intial data", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "my-new-post",
            data: {
              title: [
                {
                  type: "heading",
                  text: "My new post",
                },
              ],
              content: [
                {
                  type: "paragraph",
                  text: "Post excerpt",
                },
              ],
            },
            last_publication_date: "04-01-2021",
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "my-new-post",
              title: "My new post",
              excerpt: "Post excerpt",
              updatedAt: "01 de abril de 2021",
            },
          ],
        },
      })
    );
  });
});
