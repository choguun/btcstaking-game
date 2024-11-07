/* eslint-disable @typescript-eslint/no-unused-vars */
// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
// Author: Jason Jo

export function shortAddress(
    address: string | null | undefined,
    start = 6,
    end = 4
  ): string {
    try {
      if (!address) {
        return "";
      }
      if (address.length <= start + end) {
        return address;
      }
      return `${address.substring(0, start)}...${address.substring(
        address.length - end,
        address.length
      )}`;
    } catch (error) {
      return "";
    }
  }
  
  type InputValue = string | number | null;
  
  export function fNumber(inputValue: InputValue) {
    if (inputValue === undefined) return "";
  
    const number = Number(inputValue);
  
    const fm = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 100,
    }).format(number);
  
    return fm;
  }
  