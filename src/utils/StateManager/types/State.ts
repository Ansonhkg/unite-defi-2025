export type State = {
  stellar: {
    keypair: {
      secret: string;
      public: string;
    };
  };
  ethereum: {
    privateKey: string;
    address: string;
  };
};  
