import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { mocked } from "ts-jest/utils";
import { stripe } from "../../services/stripe";

import Home, { getStaticProps } from "../../pages/index";

jest.mock("next-auth/client");
jest.mock("next/router");
jest.mock("../../services/stripe");

describe("Home page ", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);

    useSessionMocked.mockReturnValueOnce([null, false]);
    useRouterMocked.mockReturnValueOnce({
      push: jest.fn(),
    } as any);

    const fakeProduct = {
      priceId: "id",
      amount: "R$ 9,90",
    };
    render(<Home product={fakeProduct} />);

    expect(screen.getByText("for R$ 9,90 month.")).toBeInTheDocument();
  });

  it("loads intial data", async () => {
    const stripePricesRetrieveMocked = mocked(stripe.prices.retrieve);

    stripePricesRetrieveMocked.mockResolvedValueOnce({
      id: "fake-price-id",
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: "fake-price-id",
            amount: "$10.00",
          },
        },
      })
    );
  });
});
