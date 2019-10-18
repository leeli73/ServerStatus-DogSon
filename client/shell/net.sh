#!/bin/bash
RX_pre=$(cat /proc/net/dev | grep eth0 | sed 's/:/ /g' | awk '{print $2}')
TX_pre=$(cat /proc/net/dev | grep eth0 | sed 's/:/ /g' | awk '{print $10}')
echo $RX_pre


cat /proc/net/dev | grep eth0 | sed 's/:/ /g' | awk '{print $2}' && cat /proc/net/dev | grep eth0 | sed 's/:/ /g' | awk '{print $10}'