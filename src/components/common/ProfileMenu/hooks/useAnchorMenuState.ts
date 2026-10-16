import { useState, useCallback } from "react";

interface UseAnchorMenuStateProps {
  externalAnchorEl?: HTMLElement | null;
  externalOnClose?: () => void;
}

export const useAnchorMenuState = ({
  externalAnchorEl,
  externalOnClose,
}: UseAnchorMenuStateProps) => {
  const [internalAnchorEl, setInternalAnchorEl] = useState<HTMLElement | null>(null);

  const anchorEl = externalAnchorEl ?? internalAnchorEl;
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!externalAnchorEl) {
      setInternalAnchorEl(event.currentTarget);
    }
  };

  const handleClose = useCallback(() => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalAnchorEl(null);
    }
  }, [externalOnClose]);

  return {
    anchorEl,
    open,
    handleClick,
    handleClose,
  };
};
