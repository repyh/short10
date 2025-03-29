import { useState, useEffect } from "react";
import ThemeToggle from "@/app/components/ThemeToggle";
import { useTheme } from "@/app/context/ThemeContext";

interface ShortURL {
    id: string;
    targetURL: string;
    clicks: number;
    createdAt: string;
}

export default function Main() {
    const { theme } = useTheme();
    const [url, setUrl] = useState("");
    const [customId, setCustomId] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [shortenedUrls, setShortenedUrls] = useState<ShortURL[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [customIdError, setCustomIdError] = useState("");
    const [getWindowLocation, setWindowLocation] = useState("");

    useEffect(() => {
        fetchShortUrls();
        setWindowLocation(window.location.origin);
    }, []);

    const fetchShortUrls = async () => {
        try {
            const response = await fetch('/api/short');
            if (!response.ok) {
                throw new Error('Failed to fetch shortened URLs');
            }
            const data = await response.json();
            setShortenedUrls(data);
        } catch (error) {
            console.error('Error fetching shortened URLs:', error);
            setError('Failed to load shortened URLs');
        }
    };

    const createShortUrl = async () => {
        if (!url) {
            setError('Please enter a URL');
            return;
        }

        let targetURL = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            targetURL = 'https://' + url;
        }

        if (customId) {
            if (!/^[a-zA-Z0-9-_]+$/.test(customId)) {
                setCustomIdError('Custom path can only contain letters, numbers, hyphens, and underscores');
                return;
            }
        }

        setIsLoading(true);
        setError('');
        setCustomIdError('');

        try {
            const response = await fetch('/api/short', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetURL,
                    customId: customId || undefined
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create short URL');
            }

            const newUrl = await response.json();
            setShortenedUrls([newUrl, ...shortenedUrls]);
            setUrl('');
            setCustomId('');
        } catch (error: any) {
            console.error('Error creating short URL:', error);
            if (error.message.includes("Custom ID already exists")) {
                setCustomIdError(error.message);
            } else {
                setError(error.message || 'Failed to create short URL');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (shortId: string) => {
        try {
            const fullUrl = `${window.location.origin}/${shortId}`;
            await navigator.clipboard.writeText(fullUrl);
            setCopySuccess(shortId);

            setTimeout(() => {
                setCopySuccess(null);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            setError('Failed to copy to clipboard');
        }
    };

    const openInNewTab = (shortId: string) => {
        window.open(`${window.location.origin}/${shortId}`, '_blank');
    };

    const deleteShortUrl = async (id: string) => {
        if (deleteConfirm !== id) {
            setDeleteConfirm(id);
            setTimeout(() => {
                if (deleteConfirm === id) {
                    setDeleteConfirm(null);
                }
            }, 3000);
            return;
        }

        setIsDeleting(id);
        try {
            const response = await fetch(`/api/short/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete URL');
            }

            setShortenedUrls(shortenedUrls.filter(item => item.id !== id));
            setDeleteConfirm(null);
        } catch (error: any) {
            console.error('Error deleting URL:', error);
            setError(error.message || 'Failed to delete URL');
        } finally {
            setIsDeleting(null);
        }
    };

        const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const filteredUrls = shortenedUrls.filter(item =>
        item.targetURL.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-inter transition-colors duration-200">
            <header className="border-b border-gray-200 dark:border-gray-800/50 py-4 sm:py-5 px-4 sm:px-8 backdrop-blur-sm bg-white/90 dark:bg-black sticky top-0 z-50 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-2xl sm:text-3xl font-bold nunito">
                            <span className="text-gray-900 dark:text-white">Short</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">10</span>
                        </h1>
                        <div className="hidden md:flex items-center space-x-1 ml-8">
                            <button className="flex items-center px-5 py-2 text-sm font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 border border-blue-200 dark:border-blue-800/30 transition-all nunito">
                                <span className="mr-2">📊</span>
                                Dashboard
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <ThemeToggle />
                        <a href="https://github.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 md:px-8 pb-12 pt-4 sm:pt-6">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-6 sm:space-y-8">
                        <div className="rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-sm bg-white dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800/50 shadow-lg dark:shadow-xl transition-colors duration-200">
                            <div className="p-4 sm:p-6 md:p-8">
                                <div className="flex items-center mb-5 sm:mb-6 text-gray-900 dark:text-white">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3 sm:mr-4 text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold nunito">Shorten your link</h2>
                                </div>

                                {error && (
                                    <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="bg-gray-50 dark:bg-gray-950/50 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-5 mb-5 sm:mb-6 border border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-inner transition-colors duration-200">
                                    <div className="flex flex-col gap-5 sm:gap-6">
                                        <div className="w-full space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Custom path (optional)</label>
                                            <div className="relative">
                                                <div className="flex items-center">
                                                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium mr-2 whitespace-nowrap">{getWindowLocation}/</span>
                                                    <input
                                                        type="text"
                                                        value={customId}
                                                        onChange={(e) => setCustomId(e.target.value)}
                                                        placeholder="custom-path"
                                                        className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-gray-100 dark:bg-gray-900/80 text-gray-900 dark:text-white placeholder-gray-500 border border-gray-200 dark:border-gray-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition duration-200 inter"
                                                    />
                                                </div>
                                                {customIdError && (
                                                    <div className="mt-2 text-red-600 dark:text-red-400 text-xs">
                                                        {customIdError}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Destination URL</label>
                                            <div className="flex flex-1">
                                                <input
                                                    type="text"
                                                    value={url}
                                                    onChange={(e) => setUrl(e.target.value)}
                                                    placeholder="https://your-long-destination-url.com"
                                                    className="flex-grow py-2.5 sm:py-3 px-3 sm:px-4 rounded-l-lg bg-gray-100 dark:bg-gray-900/80 text-gray-900 dark:text-white placeholder-gray-500 border border-gray-200 dark:border-gray-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition duration-200 inter"
                                                    onKeyDown={(e) => e.key === 'Enter' && createShortUrl()}
                                                />
                                                <button
                                                    onClick={createShortUrl}
                                                    disabled={isLoading}
                                                    onMouseEnter={() => setIsHovered(true)}
                                                    onMouseLeave={() => setIsHovered(false)}
                                                    className="relative overflow-hidden px-4 sm:px-6 py-2.5 sm:py-3 rounded-r-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold transition duration-200 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed nunito"
                                                >
                                                    <span className="relative z-10">
                                                        {isLoading ?
                                                            <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg> : 'Shorten'
                                                        }
                                                    </span>
                                                    <span
                                                        className={`absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                                                    ></span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="flex items-start p-2.5 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 transition-colors duration-200">
                                        <div className="rounded-full bg-blue-100 dark:bg-blue-800/30 p-1.5 mr-2.5 sm:mr-3 flex-shrink-0 text-blue-600 dark:text-blue-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs mt-[0.35rem] text-gray-700 dark:text-gray-300">Leave custom path empty for auto-generated short URL</p>
                                    </div>
                                    <div className="flex items-start p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/20 transition-colors duration-200">
                                        <div className="rounded-full bg-purple-100 dark:bg-purple-800/30 p-1.5 mr-3 flex-shrink-0 text-purple-600 dark:text-purple-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs mt-[0.35rem] text-gray-700 dark:text-gray-300">Custom paths should be unique and memorable</p>
                                    </div>
                                    <div className="flex items-start p-2.5 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 transition-colors duration-200">
                                        <div className="rounded-full bg-blue-100 dark:bg-blue-800/30 p-1.5 mr-2.5 sm:mr-3 flex-shrink-0 text-blue-600 dark:text-blue-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                        </div>
                                        <p className="text-xs mt-[0.35rem] text-gray-700 dark:text-gray-300">Use letters, numbers, hyphens, and underscores only</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-sm bg-white dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800/50 shadow-lg dark:shadow-xl transition-colors duration-200">
                            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800/50 flex flex-col md:flex-row md:justify-between md:items-center gap-3 sm:gap-4 transition-colors duration-200">
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-base sm:text-lg font-bold nunito text-gray-900 dark:text-white transition-colors duration-200">Your Links</h3>
                                </div>
                                <div className="flex items-center w-full md:w-auto">
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search links..."
                                            className="w-full py-2 sm:py-2.5 pl-9 sm:pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-500 border border-gray-200 dark:border-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm inter transition-colors duration-200"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm("")}
                                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {shortenedUrls.length === 0 ? (
                                    <div className="py-12 sm:py-16 px-4 text-center text-gray-400">
                                        <div className="w-16 h-16 mx-auto mb-4 opacity-30 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full p-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <p className="text-lg mb-2 font-semibold nunito">No links shortened yet</p>
                                        <p className="text-sm text-gray-500">Create your first short URL above to get started!</p>
                                    </div>
                                ) : filteredUrls.length === 0 ? (
                                    <div className="py-12 sm:py-16 px-4 text-center text-gray-400">
                                        <div className="w-16 h-16 mx-auto mb-4 opacity-30 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full p-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-lg mb-2 font-semibold nunito">No results found</p>
                                        <p className="text-sm text-gray-500">Try a different search term</p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden">
                                        <div className="md:hidden">
                                            {filteredUrls.map((item) => (
                                                <div key={item.id} className="p-4 border-b border-gray-200 dark:border-gray-800/30">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="text-blue-600 dark:text-blue-400 font-medium nunito break-all">
                                                            {getWindowLocation}/{item.id}
                                                        </div>
                                                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 ml-2">
                                                            {item.clicks} clicks
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 break-all">
                                                        {item.targetURL}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(item.createdAt)}
                                                        </div>
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => copyToClipboard(item.id)}
                                                                className={`transition-colors hover:bg-gray-200 dark:hover:bg-gray-800/30 rounded-full p-1.5 ${copySuccess === item.id ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-400'}`}
                                                                title={copySuccess === item.id ? "Copied!" : "Copy to clipboard"}
                                                            >
                                                                {copySuccess === item.id ? (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => openInNewTab(item.id)}
                                                                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800/30 rounded-full p-1.5 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => deleteShortUrl(item.id)}
                                                                disabled={isDeleting === item.id}
                                                                className={`transition-colors hover:bg-gray-200 dark:hover:bg-gray-800/30 rounded-full p-1.5 ${deleteConfirm === item.id ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'}`}
                                                            >
                                                                {isDeleting === item.id ? (
                                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800/30 inter transition-colors duration-200 hidden md:table">
                                            <thead className="bg-gray-100 dark:bg-gray-900/30 transition-colors duration-200">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                                        Original URL
                                                    </th>
                                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                                        Short URL
                                                    </th>
                                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                                        Clicks
                                                    </th>
                                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                                        Created
                                                    </th>
                                                    <th scope="col" className="relative px-6 py-4">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/30 bg-white dark:bg-black/20 transition-colors duration-200">
                                                {filteredUrls.map((item) => (
                                                    <tr key={item.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/5 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <div className="text-gray-700 dark:text-gray-300 truncate max-w-xs">{item.targetURL}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center space-x-1">
                                                                <div className="text-blue-600 dark:text-blue-400 font-medium nunito">
                                                                    {getWindowLocation}/{item.id}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 transition-colors duration-200">
                                                                {item.clicks}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                                                            {formatDate(item.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex space-x-3 justify-end">
                                                                <button
                                                                    onClick={() => copyToClipboard(item.id)}
                                                                    className={`transition-colors hover:bg-gray-200 dark:hover:bg-gray-800/30 rounded-full p-1.5 ${copySuccess === item.id ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-400'}`}
                                                                    title={copySuccess === item.id ? "Copied!" : "Copy to clipboard"}
                                                                >
                                                                    {copySuccess === item.id ? (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => openInNewTab(item.id)}
                                                                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800/30 rounded-full p-1.5 transition-colors"
                                                                    title="Open in new tab"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteShortUrl(item.id)}
                                                                    disabled={isDeleting === item.id}
                                                                    className={`transition-colors hover:bg-gray-200 dark:hover:bg-gray-800/30 rounded-full p-1.5 ${deleteConfirm === item.id ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'}`}
                                                                    title={deleteConfirm === item.id ? "Click again to confirm" : "Delete URL"}
                                                                >
                                                                    {isDeleting === item.id ? (
                                                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                    ) : (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-3 sm:py-4 px-4 sm:px-8 border-t border-gray-200 dark:border-gray-800/50 bg-white dark:bg-black text-center text-gray-500 text-xs sm:text-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto">
                    <p>© {new Date().getFullYear()} repyh.com - All rights reserved</p>
                </div>
            </footer>
        </div>
    );
}