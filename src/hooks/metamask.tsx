import React, { useState, useEffect, FC, useMemo, useCallback } from 'react'
import { injected } from '../components/wallet/connectors'
import { useWeb3React } from '@web3-react/core';

export const MetaMaskContext = React.createContext({})

export const MetaMaskProvider: FC = ({ children }) => {

    const { chainId, activate, account, library, active, deactivate } = useWeb3React()
    const [isActive, setIsActive] = useState(false)
    const [shouldDisable, setShouldDisable] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const connect = useCallback(async () => {
        setShouldDisable(true)
        try {
            await activate(injected).then(() => {
                setShouldDisable(false)
            })
        } catch(error) {
            console.log('Error on connecting: ', error)
        }
    }, [activate])

    const disconnect = useCallback(async () => {
        try {
            await deactivate()
        } catch(error) {
            console.log('Error on disconnnect: ', error)
        }
    }, [deactivate])

    // Init Loading
    useEffect(() => {
        connect().then(val => {
            setIsLoading(false)
        })
    }, [account, connect, library])

    // Check when App is Connected or Disconnected to MetaMask
    const handleIsActive = useCallback(() => {
        console.log('App is connected with MetaMask ', active)
        setIsActive(active)
    }, [active])

    useEffect(() => {
        handleIsActive()
    }, [handleIsActive])

    const values = useMemo(
        () => ({
            isActive,
            account,
            isLoading,
            connect,
            disconnect,
            shouldDisable,
            chainId,
        }),
        [connect, disconnect, isActive, isLoading, shouldDisable, account, chainId]
    )

    return <MetaMaskContext.Provider value={values}>{children}</MetaMaskContext.Provider>
}

export default function useMetaMask(): any {
    const context = React.useContext(MetaMaskContext)

    if (context === undefined) {
        throw new Error('useMetaMask hook must be used with a MetaMaskProvider component')
    }

    return context
}