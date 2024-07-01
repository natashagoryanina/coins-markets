import { useEffect, useState } from "react";
import "./App.css";
import {
  Flex,
  Modal,
  Select,
  Table,
  TableColumnsType,
  TablePaginationConfig,
  Typography,
  Image,
  Tooltip,
  List,
} from "antd";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const TOTAL_COUNT = 10000;
const TOOLTIP_COLOR = "#f8f8f8";

type CurrencyItem = {
  name: string;
  symbol: string;
};

const currencies: { [key: string]: CurrencyItem } = {
  usd: {
    name: "usd",
    symbol: "$",
  },
  eur: {
    name: "eur",
    symbol: "€",
  },
};

type CryptoPricesData = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: object | null;
  last_updated: string;
};

// utils
function formatNumber(num: number | null): string {
  if (num === null) return "--";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatLargeNumber(num: number | null): string {
  if (num === null) return "--";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return num.toLocaleString();
  return num.toString();
}

type ModalTooltipProps = {
  text: string;
};

const ModalTooltip = ({ text }: ModalTooltipProps) => {
  return (
    <Tooltip
      placement="right"
      title={() => <Text className="tooltip-text">{text}</Text>}
      color={TOOLTIP_COLOR}
      overlayClassName="tooltip-card"
      overlayInnerStyle={{ padding: "10px 15px" }}
    >
      <ExclamationCircleOutlined className="info-icon" />
    </Tooltip>
  );
};

type PriceChangePercentageProps = {
  percentage: number | null;
};

const PriceChangePercentage = ({ percentage }: PriceChangePercentageProps) => {
  return (
    <div>
      {!percentage ? (
        <Text>--</Text>
      ) : (
        <div className="percentage">
          {percentage < 0 ? (
            <CaretDownOutlined className={"negative_percentage caret"} />
          ) : (
            <CaretUpOutlined className={"positive_percentage caret"} />
          )}
          <Text
            className={`${
              percentage < 0 ? "negative_percentage" : "positive_percentage"
            } ${"percentage"}`}
          >
            {percentage.toFixed(2)}&nbsp;%
          </Text>
        </div>
      )}
    </div>
  );
};

type CryptoDataElementProps = {
  title: string;
  value: string;
  tooltipText: string;
  currency?: string;
  cryptoSymbol?: string;
};

const CryptoDataElement = ({
  title,
  currency,
  cryptoSymbol,
  value,
  tooltipText,
}: CryptoDataElementProps) => {
  return (
    <>
      <Flex align="center" gap="small">
        <Text className="data-name">{title}</Text>
        <ModalTooltip text={tooltipText} />
      </Flex>
      <Text className="data-value">
        {currency && <>{currency}</>}
        {value}
        {cryptoSymbol && (
          <span className="crypto-symbol">&nbsp;{cryptoSymbol}</span>
        )}
      </Text>
    </>
  );
};

type CryptoDataElementsListProps = {
  data: CryptoPricesData;
  currency: string;
};

const CryptoDataElementsList = ({
  data,
  currency,
}: CryptoDataElementsListProps) => {
  const cryptoDataElements = [
    {
      title: "Market cap",
      tooltipText:
        "The total market value of a cryptocurrency's circulating supply. It is analogous to the free-float capitalization in the stock market.",
      value: formatLargeNumber(data.market_cap),
      currency: currencies[currency].symbol,
    },
    {
      title: "Volume (24h)",
      tooltipText:
        "A measure of how much of a cryptocurrency was traded in the last 24 hours.",
      value: formatLargeNumber(data.total_volume),
      currency: currencies[currency].symbol,
    },
    {
      title: "Circulating supply",
      tooltipText:
        "The amount of coins that are circulating in the market and are in public hands. It is analogous to the flowing shares in the stock market.",
      value: formatNumber(data.circulating_supply),
      cryptoSymbol: data.symbol,
    },
    {
      title: "Total supply",
      tooltipText:
        "Total supply = Total coins created - coins that have been burned (if any) It is comparable to outstanding shares in the stock market.",
      value: formatNumber(data.total_supply),
      cryptoSymbol: data.symbol,
    },
    {
      title: "Max. supply",
      tooltipText:
        "The maximum amount of coins that will ever exist in the lifetime of the cryptocurrency. It is analogous to the fully diluted shares in the stock market.",
      value: formatNumber(data.max_supply),
      cryptoSymbol: data.symbol,
    },
    {
      title: "Fully diluted valuation",
      tooltipText:
        "The total value of a cryptocurrency project considering all of its tokens that are in circulation.",
      value: formatLargeNumber(data.fully_diluted_valuation),
      currency: currencies[currency].symbol,
    },
  ];

  return (
    <div>
      <List
        dataSource={cryptoDataElements}
        renderItem={(item) => (
          <List.Item>
            <CryptoDataElement
              key={item.title}
              title={item.title}
              tooltipText={item.tooltipText}
              value={item.value}
              currency={item.currency}
              cryptoSymbol={item.cryptoSymbol}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

type CryptoModalProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  data: CryptoPricesData;
  currency: string;
};

const CryptoModal = ({
  isOpen,
  setIsOpen,
  data,
  currency,
}: CryptoModalProps) => {
  return (
    <Modal open={isOpen} footer={null} onCancel={() => setIsOpen(false)}>
      <Flex align="center" gap="small">
        <Image
          width={38}
          height={38}
          src={data.image}
          alt="cryptocurrency icon"
          preview={false}
        />
        <Text className="crypto-name">
          {data.name}&nbsp;<span className="crypto-symbol">{data.symbol}</span>
        </Text>
      </Flex>
      <Flex align="center" gap="small">
        <Text className="crypto-price">
          {currencies[currency].symbol}
          {formatNumber(data.current_price)}
        </Text>
        <div>
          <PriceChangePercentage
            percentage={data.price_change_percentage_24h}
          />
        </div>
      </Flex>
      <CryptoDataElementsList data={data} currency={currency} />
    </Modal>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [cryptoData, setCryptoData] = useState<CryptoPricesData[]>([]);
  const [page, setPage] = useState<number>(DEFAULT_PAGE);
  const [rows, setRows] = useState<number>(DEFAULT_PAGE_SIZE);
  const [currency, setCurrency] = useState<string>("usd");
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<CryptoPricesData | undefined>(
    undefined
  );

  const fetchData = async (currency: string, rows: number, page: number) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${rows}&page=${page}&sparkline=false`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      setCryptoData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currency, rows, page);
  }, [currency, rows, page]);

  const columns: TableColumnsType<CryptoPricesData> = [
    { title: "#", dataIndex: "market_cap_rank", width: 70, fixed: "left" },
    {
      title: "Name",
      dataIndex: "name",
      render: (_, record) => (
        <Flex gap="small" align="center">
          <Image
            width={32}
            height={32}
            src={record.image}
            alt="cryptocurrency icon"
            preview={false}
          />
          <Text>
            {record.name}&nbsp;
            <span className="crypto-symbol">{record.symbol}</span>
          </Text>
        </Flex>
      ),
      width: 250,
      fixed: "left",
    },
    {
      title: "Current Price",
      dataIndex: "current_price",
      sorter: (a, b) => a.current_price - b.current_price,
      render: (_, record) => (
        <Text>
          {currencies[currency].symbol}
          {formatNumber(record.current_price)}
        </Text>
      ),
    },
    {
      title: "24h %",
      dataIndex: "price_change_percentage_24h",
      sorter: (a, b) =>
        a.price_change_percentage_24h - b.price_change_percentage_24h,
      render: (_, record) => (
        <PriceChangePercentage
          percentage={record.price_change_percentage_24h}
        />
      ),
    },
    {
      title: "Market Cap",
      dataIndex: "market_cap",
      sorter: (a, b) => a.market_cap - b.market_cap,
      render: (_, record) => (
        <Text>
          {currencies[currency].symbol}
          {formatNumber(record.market_cap)}
        </Text>
      ),
    },
    {
      title: "Volume(24h)",
      dataIndex: "total_volume",
      sorter: (a, b) => a.total_volume - b.total_volume,
      render: (_, record) => (
        <Text>
          {currencies[currency].symbol}
          {formatNumber(record.total_volume)}
        </Text>
      ),
    },
    {
      title: "Circulating Supply",
      dataIndex: "circulating_supply",
      sorter: (a, b) => a.circulating_supply - b.circulating_supply,
      render: (_, record) => (
        <Text>
          {formatNumber(record.circulating_supply)}&nbsp;
          <span className="crypto-symbol">{record.symbol}</span>
        </Text>
      ),
      width: 250,
    },
  ];

  const onTableChange = (pagination: TablePaginationConfig) => {
    const newPage = pagination.current || DEFAULT_PAGE;
    const newPageSize = pagination.pageSize || DEFAULT_PAGE_SIZE;

    setPage(newPage);
    setRows(newPageSize);
  };

  const selectCurrency = (value: string) => {
    setCurrency(value);
  };

  const onRowClick = (data: CryptoPricesData) => {
    setSelectedRow(data);
    setIsCryptoModalOpen(true);
  };

  return (
    <div className="wrapper">
      <Title level={2}>Coins & Markets</Title>
      <Flex align="center">
        <Text className="select-currency-title">Select a currency:</Text>
        <Select
          defaultValue="USD"
          className="currency-select"
          options={[
            { value: "usd", label: "USD" },
            { value: "eur", label: "EUR" },
          ]}
          onChange={selectCurrency}
        />
      </Flex>
      <Table
        className="table-wrap"
        columns={columns}
        loading={isLoading}
        dataSource={cryptoData}
        rowKey="id"
        pagination={{
          total: TOTAL_COUNT,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} out of ${total} items`,
          defaultCurrent: DEFAULT_PAGE,
          defaultPageSize: DEFAULT_PAGE_SIZE,
          pageSizeOptions: ["5", "10", "20", "50", "100"],
        }}
        onChange={onTableChange}
        scroll={{ x: 1200, y: "80vh" }}
        onRow={(record) => {
          return {
            onClick: () => onRowClick(record),
            style: { cursor: "pointer" },
          };
        }}
      />
      {isCryptoModalOpen && selectedRow && (
        <CryptoModal
          isOpen={isCryptoModalOpen}
          setIsOpen={setIsCryptoModalOpen}
          data={selectedRow}
          currency={currency}
        />
      )}
    </div>
  );
}

export default App;
