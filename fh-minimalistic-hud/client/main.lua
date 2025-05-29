if Config.Framework == 'esx' then ESX = exports['es_extended']:getSharedObject() end
local display = true
local lastPlayers, lastMaxPlayers, lastPlayerId = 0, 0, 0
local lastBankMoney, lastCashMoney = 0, 0

function UpdateHud(force)
    if not display then return end
    
    local players = #GetActivePlayers()
    local maxPlayers = Config.MaxPlayers
    local playerId = GetPlayerServerId(PlayerId())
    
    if force or players ~= lastPlayers or maxPlayers ~= lastMaxPlayers then
        if Config.Elements.players.enabled then
            SendNUIMessage({
                type = 'updatePlayers',
                count = players,
                max = maxPlayers
            })
        end
        lastPlayers, lastMaxPlayers = players, maxPlayers
    end

    if force or playerId ~= lastPlayerId then
        if Config.Elements.id.enabled then
            SendNUIMessage({
                type = 'updatePlayerId',
                id = playerId
            })
        end
        lastPlayerId = playerId
    end
end

function UpdateMoney(force)
    if not display then return end
    
    local playerData = nil

    if Config.Framework == 'esx' then
        playerData = ESX.GetPlayerData()
        if not playerData or not playerData.accounts then return end
        for _, account in ipairs(playerData.accounts) do
            if account.name == 'bank' and (force or account.money ~= lastBankMoney) then
                if Config.Elements.bank.enabled then
                    SendNUIMessage({
                        type = 'updateBankMoney',
                        amount = account.money
                    })
                end
                lastBankMoney = account.money
            elseif (account.name == 'money' or account.name == 'cash') and (force or account.money ~= lastCashMoney) then
                if Config.Elements.cash.enabled then
                    SendNUIMessage({
                        type = 'updateCashMoney',
                        amount = account.money
                    })
                end
                lastCashMoney = account.money
            end
        end
    elseif Config.Framework == 'qbx' then
        playerData = QBX.PlayerData

        if not playerData or not playerData.money then return end

        if (force or playerData.money.bank ~= lastBankMoney) then
            if Config.Elements.bank.enabled then
                SendNUIMessage({
                    type = 'updateBankMoney',
                    amount = playerData.money.bank
                })
            end
            lastBankMoney = playerData.money.bank
        end
        if (force or playerData.money.cash ~= lastCashMoney) then
            if Config.Elements.cash.enabled then
                SendNUIMessage({
                    type = 'updateCashMoney',
                    amount = playerData.money.cash
                })
            end
            lastCashMoney = playerData.money.cash
        end
    end
end

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(Config.HudSettings.refreshRate)
        UpdateHud()
        UpdateMoney()
    end
end)

Citizen.CreateThread(function()
    Citizen.Wait(1000)
    SendNUIMessage({
        type = 'initConfig',
        config = Config
    })

    Citizen.Wait(200)
    UpdateHud(true)
    UpdateMoney(true)
    SendNUIMessage({
        type = 'toggleDisplay',
        show = display
    })
end)

