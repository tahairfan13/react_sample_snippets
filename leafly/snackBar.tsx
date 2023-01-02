import React, { createContext, useContext, useEffect, useState } from "react";
import getConfig from "next/config";
import { useSelector } from "react-redux";
// @ts-ignore (fix me please, do not replicate)
import { CSSTransition } from "react-transition-group";

import { getCookie, removeCookie, setCookie } from "common/cookies";
import useQueue from "hooks/useQueue";
import logger from "lib/logger";
import { getDomainCountryCode } from "redux/selectors/location";
import { getIsLoggedOutRedirect } from "redux/selectors/user";
import { Action, Category, trackEvent } from "utils/trackEvent";

import Snackbar from "components/Snackbar";

const SNACK_COOKIE_NAME = "snackbar_message";
const SNACK_TRANSITION_TIMEOUT = 300;
const SNACK_FULL_DURATION = 4000;
const SNACK_VISIBLE_DURATION = SNACK_FULL_DURATION - SNACK_TRANSITION_TIMEOUT;

export enum SnackBarMessages {
  accountCreated = "accountCreated",
  accountDeleted = "accountDeleted",
  favoriteAdded = "favoriteAdded",
  favoriteRemoved = "favoriteRemoved",
  dispensaryAdded = "dispensaryAdded",
  dispensaryRemoved = "dispensaryRemoved",
  dispensaryReviewSubmitted = "dispensaryReviewSubmitted",
  signedIn = "signedIn",
  reviewSubmitted = "reviewSubmitted",
  saveStrainPreferences = "saveStrainPreferences",
  resultsFilteredToDispensary = "resultsFilteredToDispensary",
  signedOut = "signedOut",
  linkCopiedToClipboard = "linkCopiedToClipboard",
  linkCopiedToClipboardError = "linkCopiedToClipboardError",
}

const SNACK_BAR_MESSAGING: Record<string, Record<string, string>> = {
  [SnackBarMessages.accountCreated]: {
    eventLabel: "account created",
    icon: "circle_check_mark.svg",
    message: "Account successfully created!",
  },
  [SnackBarMessages.accountDeleted]: {
    eventLabel: "account deleted",
    icon: "circle_check_mark.svg",
    message: "Your account has been deleted",
  },
  [SnackBarMessages.favoriteAdded]: {
    eventLabel: "strain favorite added",
    icon: "heart_filled.svg",
    message: "Strain added to favorites!",
  },
  [SnackBarMessages.favoriteRemoved]: {
    eventLabel: "strain favorite removed",
    icon: "heart_outline.svg",
    message: "Strain removed from favorites!",
  },
  [SnackBarMessages.dispensaryAdded]: {
    eventLabel: "dispensary favorite added",
    icon: "circle_check_mark.svg",
    message: "Dispensary added to favorites!",
  },
  [SnackBarMessages.dispensaryRemoved]: {
    eventLabel: "dispensary favorite removed",
    icon: "circle_check_mark.svg",
    message: "Dispensary removed from favorites!",
  },
  [SnackBarMessages.dispensaryReviewSubmitted]: {
    eventLabel: "dispensary review submitted",
    icon: "circle_check_mark.svg",
    message: "Thank you for submitting a review",
  },
  [SnackBarMessages.signedIn]: {
    eventLabel: "signed in",
    icon: "circle_check_mark.svg",
    message: "You've successfully signed in!",
  },
  [SnackBarMessages.reviewSubmitted]: {
    eventLabel: "review submitted",
    icon: "circle_check_mark.svg",
    message: "Thank you for submitting a review!",
  },
  [SnackBarMessages.saveStrainPreferences]: {
    eventLabel: "strain preferences saved",
    icon: "circle_check_mark.svg",
    message: "Your strain preferences have been saved!",
  },
  [SnackBarMessages.resultsFilteredToDispensary]: {
    eventLabel: "results filtered to dispensary",
    icon: "circle_check_mark.svg",
    message: "Results filtered to dispensary bag",
  },
  [SnackBarMessages.signedOut]: {
    eventLabel: "signed out",
    icon: "circle_check_mark.svg",
    message: "You've successfully signed out!",
  },
  [SnackBarMessages.linkCopiedToClipboard]: {
    eventLabel: "link copied to clipboard",
    icon: "circle_check_mark.svg",
    message: "Link copied to your clipboard",
  },
  [SnackBarMessages.linkCopiedToClipboardError]: {
    eventLabel: "link copied to clipboard error",
    icon: "circle_x.svg",
    message: "Error when copying link to your clipboard",
  },
};

type QueueItem = keyof typeof SNACK_BAR_MESSAGING;

type SnackBarContextProps = {
  addSnackBarItem: (queueItem: QueueItem) => void;
  addSnackBarCookie: (cookieValue: string) => void;
};

const SnackBarContext = createContext<SnackBarContextProps>({
  addSnackBarCookie: () => false,
  addSnackBarItem: () => false,
});

type SnackBarProviderProps = {
  children: JSX.Element | JSX.Element[];
};

const {
  publicRuntimeConfig: { cookieDomainCa, cookieDomain },
} = getConfig();

export const SnackBarProvider = ({ children }: SnackBarProviderProps) => {
  const [snackVisible, setSnackVisible] = useState<boolean>(false);
  const countryCode = useSelector(getDomainCountryCode);
  const snackMessageCookie = getCookie(SNACK_COOKIE_NAME);

  const removeSnackCookie = () => {
    removeCookie(
      SNACK_COOKIE_NAME,
      countryCode === "CA" ? cookieDomainCa : cookieDomain
    );
  };

  const queueFn = (queueItem: QueueItem, removeFromQueue: () => void) => {
    setSnackVisible(true);

    trackEvent(
      Category.notification,
      Action.snackbar,
      SNACK_BAR_MESSAGING[queueItem].eventLabel
    );

    // Timer to determine visibility of snack message.
    // This is seprated from the queue timer below so that
    // the animation can complete before being removed
    // from the queue
    const visibilityTimer = setTimeout(() => {
      // If we get a snack message from the browser cookies
      // we need to remove it from the cookies to prevent
      // the snack message from showing up again
      if (snackMessageCookie) {
        removeSnackCookie();
      }

      setSnackVisible(false);
    }, SNACK_VISIBLE_DURATION);

    const queueTimer = setTimeout(() => {
      removeFromQueue();
    }, SNACK_FULL_DURATION);

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(queueTimer);
    };
  };

  const [queue, addQueueItem] = useQueue(queueFn);

  const addSnackBarItem = (queueItem: QueueItem) => {
    if (Object.keys(SNACK_BAR_MESSAGING)?.includes(queueItem)) {
      addQueueItem(queueItem);
    } else {
      if (snackMessageCookie) {
        removeSnackCookie();
      }

      logger.warn(
        "This snack message does not currently exist, add to SNACK_BAR_MESSAGING object above."
      );
    }
  };

  useEffect(() => {
    if (snackMessageCookie) {
      const snacks = snackMessageCookie.split(",");
      snacks.forEach((item) => {
        addSnackBarItem(item);
      });
    }
  }, [snackMessageCookie]);

  const addSnackBarCookie = (cookieValue: string) => {
    const expires = new Date(new Date().getTime() + 15 * 1000); // 15 seconds
    setCookie(
      SNACK_COOKIE_NAME,
      cookieValue,
      countryCode === "CA" ? cookieDomainCa : cookieDomain,
      expires
    );
  };

  const isLoggedOutRedirect = useSelector(getIsLoggedOutRedirect);
  useEffect(() => {
    if (isLoggedOutRedirect) {
      addSnackBarItem(SnackBarMessages.signedOut);
    }
  }, [isLoggedOutRedirect]);

  const snackInQueue = queue[0];

  return (
    <SnackBarContext.Provider
      value={{
        addSnackBarCookie,
        addSnackBarItem,
      }}
    >
      {children}
      <CSSTransition
        in={snackVisible}
        timeout={SNACK_TRANSITION_TIMEOUT}
        classNames="snack-bar"
        unmountOnExit
      >
        <div
          className="fixed px-lg w-full bottom-0 z-20"
          data-testid="snack-bar-transition-container"
        >
          {SNACK_BAR_MESSAGING?.[snackInQueue]?.message && (
            <div className="w-full mx-auto mb-md" style={{ maxWidth: 492 }}>
              <Snackbar
                message={SNACK_BAR_MESSAGING[snackInQueue].message}
                iconFilePath={SNACK_BAR_MESSAGING[snackInQueue]?.icon}
              />
            </div>
          )}
        </div>
      </CSSTransition>
    </SnackBarContext.Provider>
  );
};

export const useSnackBar = (): SnackBarContextProps =>
  useContext(SnackBarContext);

export default SnackBarContext;
