// @flow
import invariant from "invariant";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import SafeAreaView from "react-native-safe-area-view";
import { createAction } from "@ledgerhq/live-common/lib/hw/signMessage";
import type { TypedMessageData } from "@ledgerhq/live-common/lib/families/ethereum/types";
import type { MessageData } from "@ledgerhq/live-common/lib/hw/signMessage/types";
import connectApp from "@ledgerhq/live-common/lib/hw/connectApp";
import { accountScreenSelector } from "../../reducers/accounts";
import DeviceAction from "../../components/DeviceAction";
import { TrackScreen } from "../../analytics";
import { ScreenName } from "../../const";

const action = createAction(connectApp);

type Props = {
  navigation: any,
  route: {
    params: RouteParams,
    name: string,
  },
};

type RouteParams = {
  device: Device,
  accountId: string,
  message: TypedMessageData | MessageData,
};

export default function ConnectDevice({ route, navigation }: Props) {
  const { account, parentAccount } = useSelector(accountScreenSelector(route));
  invariant(account, "account is required");

  const onResult = result => {
    if (result.error) {
      navigation.navigate(ScreenName.SignValidationError, {
        ...route.params,
        error: result.error,
      });
    } else if (result.signature) {
      navigation.navigate(ScreenName.SignValidationSuccess, {
        ...route.params,
        signature: result.signature,
      });
    }
  };

  return useMemo(
    () => (
      <SafeAreaView style={styles.root}>
        <TrackScreen category={"SignMessage"} name="ConnectDevice" />
        <DeviceAction
          action={action}
          request={{
            account,
            parentAccount,
            message: route.params.message,
          }}
          device={route.params.device}
          onResult={onResult}
        />
      </SafeAreaView>
    ),
    // prevent rerendering caused by optimistic update (i.e. exclude account related deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [route.params.message],
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },
});
