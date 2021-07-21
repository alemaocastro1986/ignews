import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { getSession } from "next-auth/client";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { getPrismicClient } from "../../services/prismic";

jest.mock("next-auth/client");
jest.mock("../../services/prismic");
const post = {
  slug: "unit-testing-in-reactjs",
  title: "Unit testing in ReactJS",
  content: "<p>This is a test.</p>",
  updatedAt: "1 de Abril",
};

describe("Post page", () => {
  it("renders correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("Unit testing in ReactJS")).toBeInTheDocument();
    expect(screen.getByText("This is a test.")).toBeInTheDocument();
  });

  it("redirects user if not subscription is found.", async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      req: {
        cookies: {},
      },
      params: {
        slug: "unit-testing-reactjs",
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
        }),
      })
    );
  });

  it("loads initial data", async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      user: {
        name: "John Doe",
        email: "jd@test.com",
      },
      activeSubscription: true,
    });

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "React Jest testing" }],
          content: [{ type: "paragraph", text: "Testing" }],
        },
        last_publication_date: "2021-04-01",
      }),
    } as any);

    const response = await getServerSideProps({
      params: { slug: "unit-testing-in-reactjs" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: expect.objectContaining({
            slug: "unit-testing-in-reactjs",
            title: "React Jest testing",
            content: "<p>Testing</p>",
            updatedAt: "31 de março de 2021",
          }),
        },
      })
    );
  });
});
