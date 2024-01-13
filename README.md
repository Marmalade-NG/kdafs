# KDAFS Implementation (KIP 025)

## Intro

This repository contains an implementation of the proposed draft KIP 025.

https://github.com/kadena-io/KIPs/blob/75099f2e112c87ad4669f1a643cbd7bf49cfce66/kip-0025.md

https://github.com/kadena-io/KIPs/pull/54

At first, this is a proof of concept and should not be considered as a "bug-free" reference implementation.

Only a limited number of tests has been conducted.

## Pact modules

``pact/kdafs-interface-v1.pact`` : The main interface proposed in the KIP.

``pact/kdafs-store-one.pact`` : An example of an immutable public storage contract.

``pact/kdafs-store-mut-one.pact`` : An example of a mutable public storage contract.


## Gateway

Node.js implementation of the gateway.

## Dapp

Web Dapp to retrieve directly the content of the a kdafs URL
