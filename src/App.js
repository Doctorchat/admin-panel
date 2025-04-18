import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Router from "./router";
import routes from "./router/routes";
import { setGlobalPrivateRequisites } from "./store/actions/bootstrapAction";
import { updateRequestsCount } from "./store/actions/requestsCountAction";
import { updateCouncilCount, updateSupportCount } from "./store/actions/supportListAction";
import { updateWithdrawalCount } from "./store/actions/withdrawalAction";
import { getUser } from "./store/actions/userAction";
import { ScrollToTop } from "./components";

function App() {
  const dispatch = useDispatch();
  const { isAuthorized } = useSelector((state) => ({
    isAuthorized: state.user.isAuthorized,
  }));

  useEffect(() => {
    if (isAuthorized) {
      getUser()(dispatch);
      dispatch(setGlobalPrivateRequisites());
      dispatch(updateRequestsCount());
      dispatch(updateSupportCount());
      dispatch(updateWithdrawalCount());
      dispatch(updateCouncilCount());
    }
  }, [dispatch, isAuthorized]);

  return (
    <>
      <ScrollToTop />
      <Router routes={routes} />
    </>
  );
}

export default App;
