import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { useSession } from "next-auth/client";
import PostPreview, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { useRouter } from "next/router";
import { getPrismicClient } from "../../services/prismic";

const post = {
  slug: "unit-testing-in-reactjs",
  title: "Unit testing in ReactJS",
  content: "<p>This is a test.</p>",
  updatedAt: "1 de Abril",
};

jest.mock("next-auth/client");
jest.mock("next/router");
jest.mock("../../services/prismic");

describe("PostPreview page", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<PostPreview post={post} />);

    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("redirects user if exists subscription.", async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);

    const pushMocked = jest.fn();

    useRouterMocked.mockReturnValue({
      push: pushMocked,
    } as any);

    useSessionMocked.mockReturnValueOnce([
      {
        user: {
          name: "John Doe",
          email: "jd@test.com",
        },
        activeSubscription: true,
      },
      false,
    ]);

    render(<PostPreview post={post} />);

    expect(pushMocked).toHaveBeenCalledWith("/posts/unit-testing-in-reactjs");
  });

  it("loads initial data", async () => {
    const useSessionMocked = mocked(useSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    useSessionMocked.mockReturnValue([null, false]);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "React Jest testing" }],
          content: [
            { type: "paragraph", text: "Testing" },
            { type: "paragraph", text: "Testing" },
            { type: "paragraph", text: "Testing" },
            { type: "paragraph", text: "No visible" },
          ],
        },
        last_publication_date: "2021-04-01",
      }),
    } as any);

    const response = await getStaticProps({
      params: { slug: "unit-testing-in-reactjs" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: expect.objectContaining({
            slug: "unit-testing-in-reactjs",
            title: "React Jest testing",
            content: "<p>Testing</p><p>Testing</p><p>Testing</p>",
            updatedAt: "31 de março de 2021",
          }),
        },
      })
    );
  });
});
